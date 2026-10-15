ALTER TABLE tasks
    ADD COLUMN owner_id VARCHAR(73) NOT NULL;

CREATE INDEX idx_tasks_owner_created_at_id
    ON tasks (owner_id, created_at DESC, id DESC);