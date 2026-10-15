package com.taskapp.api.task.api;

import java.time.Instant;
import java.util.UUID;

import com.taskapp.api.task.Task;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        boolean completed,
        Instant createdAt,
        Instant updatedAt) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
