package com.taskapp.api.task;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {
	Page<Task> findAllByOwnerId(String ownerId, Pageable pageable);

	java.util.Optional<Task> findByIdAndOwnerId(UUID id, String ownerId);
}