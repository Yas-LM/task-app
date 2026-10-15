package com.taskapp.api.task.api;

import jakarta.validation.constraints.Size;

public record UpdateTaskRequest(
        @Size(max = 200)
        String title,
        @Size(max = 2000)
        String description,
        Boolean completed) {

    public boolean isEmpty() {
        return title == null && description == null && completed == null;
    }
}
