package com.taskapp.api.task;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.taskapp.api.task.api.CreateTaskRequest;
import com.taskapp.api.task.api.TaskPageResponse;
import com.taskapp.api.task.api.TaskResponse;
import com.taskapp.api.task.api.UpdateTaskRequest;

@Service
@Transactional
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public TaskPageResponse list(String ownerId, Pageable pageable) {
        log.info("Listing tasks for ownerId: {}", ownerId);
        return TaskPageResponse.from(taskRepository.findAllByOwnerId(ownerId, pageable).map(TaskResponse::from));
    }

    @Transactional(readOnly = true)
    public TaskResponse get(String ownerId, UUID id) {
        log.info("Getting task with id: {} for ownerId: {}", id, ownerId);
        return TaskResponse.from(findTask(ownerId, id));
    }

    public TaskResponse create(String ownerId, CreateTaskRequest request) {
        log.info("Creating task for ownerId: {}", ownerId);
        Task task = new Task(ownerId, request.title().strip(), normalizeDescription(request.description()));
        return TaskResponse.from(taskRepository.save(task));
    }

    public TaskResponse update(String ownerId, UUID id, UpdateTaskRequest request) {
        log.info("Updating task with id: {} for ownerId: {}", id, ownerId);
        if (request.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide at least one field to update.");
        }
        if (request.title() != null && !StringUtils.hasText(request.title())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title must not be blank.");
        }

        Task task = findTask(ownerId, id);
        task.update(
                request.title() == null ? null : request.title().strip(),
                request.description() == null ? null : normalizeDescription(request.description()),
                request.completed());
        return TaskResponse.from(taskRepository.save(task));
    }

    public void delete(String ownerId, UUID id) {
        log.info("Deleting task with id: {} for ownerId: {}", id, ownerId);
        Task task = findTask(ownerId, id);
        taskRepository.delete(task);
    }

    private Task findTask(String ownerId, UUID id) {
        return taskRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
    }

    private String normalizeDescription(String description) {
        return StringUtils.hasText(description) ? description.strip() : null;
    }
}
