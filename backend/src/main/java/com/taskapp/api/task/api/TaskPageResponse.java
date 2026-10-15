package com.taskapp.api.task.api;

import java.util.List;

import org.springframework.data.domain.Page;

public record TaskPageResponse(
        List<TaskResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static TaskPageResponse from(Page<TaskResponse> tasks) {
        return new TaskPageResponse(
                tasks.getContent(),
                tasks.getNumber(),
                tasks.getSize(),
                tasks.getTotalElements(),
                tasks.getTotalPages());
    }
}
