package com.taskapp.api.task;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskapp.api.config.CorsConfiguration;
import com.taskapp.api.config.SecurityConfig;
import com.taskapp.api.task.api.CreateTaskRequest;
import com.taskapp.api.task.api.TaskResponse;

@WebMvcTest(TaskController.class)
@Import({CorsConfiguration.class, SecurityConfig.class})
class TaskControllerTest {

    private static final String GOOGLE_SUBJECT = "google-user-123";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void createReturnsLocationForCreatedTask() throws Exception {
        UUID id = UUID.randomUUID();
        when(taskService.create(org.mockito.ArgumentMatchers.eq("google:" + GOOGLE_SUBJECT),
                any(CreateTaskRequest.class))).thenReturn(
                new TaskResponse(id, "Read docs", null, false, Instant.now(), Instant.now()));

        mockMvc.perform(post("/api/tasks")
                .with(jwt().jwt(token -> token.subject(GOOGLE_SUBJECT)))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Read docs","description":null}
                    """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/tasks/" + id));

        verify(taskService).create(org.mockito.ArgumentMatchers.eq("google:" + GOOGLE_SUBJECT),
                any(CreateTaskRequest.class));
    }

    @Test
    void createRejectsBlankTitle() throws Exception {
        mockMvc.perform(post("/api/tasks")
                .with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"   "}
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void apiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsPreflightFromAnyOrigin() throws Exception {
        mockMvc.perform(options("/api/tasks")
                .header("Origin", "https://another-app.example")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://another-app.example"));
    }
}
