package com.taskapp.api.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskapp.api.task.api.CreateTaskRequest;
import com.taskapp.api.task.api.UpdateTaskRequest;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    private static final String OWNER_ID = "tenant:user";

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void createTrimsTitleAndDescription() {
        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = taskService.create(OWNER_ID, new CreateTaskRequest("  Write tests  ", "  First pass  "));

        assertThat(response.title()).isEqualTo("Write tests");
        assertThat(response.description()).isEqualTo("First pass");
        assertThat(response.completed()).isFalse();
        org.mockito.ArgumentCaptor<Task> taskCaptor = org.mockito.ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        assertThat(taskCaptor.getValue().getOwnerId()).isEqualTo(OWNER_ID);
    }

    @Test
    void updateRejectsAnEmptyPatch() {
        assertThatThrownBy(() -> taskService.update(
                        OWNER_ID, UUID.randomUUID(), new UpdateTaskRequest(null, null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("at least one field");
    }

    @Test
    void deleteRemovesOnlyTasksOwnedByTheCaller() {
        UUID id = UUID.randomUUID();
        Task task = new Task(OWNER_ID, "Task", null);
        when(taskRepository.findByIdAndOwnerId(id, OWNER_ID)).thenReturn(Optional.of(task));

        taskService.delete(OWNER_ID, id);

        verify(taskRepository).findByIdAndOwnerId(id, OWNER_ID);
        verify(taskRepository).delete(task);
    }

    @Test
    void listQueriesOnlyTheCallersTasks() {
        PageRequest pageRequest = PageRequest.of(0, 20);
        when(taskRepository.findAllByOwnerId(eq(OWNER_ID), eq(pageRequest)))
                .thenReturn(new PageImpl<>(java.util.List.of(), pageRequest, 0));

        taskService.list(OWNER_ID, pageRequest);

        verify(taskRepository).findAllByOwnerId(OWNER_ID, pageRequest);
        verify(taskRepository, never()).findAll(any(org.springframework.data.domain.Pageable.class));
    }

    @Test
    void anotherUsersTaskIsNotFound() {
        UUID id = UUID.randomUUID();
        when(taskRepository.findByIdAndOwnerId(id, OWNER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.get(OWNER_ID, id))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}