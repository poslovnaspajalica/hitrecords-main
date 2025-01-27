CREATE TABLE webhook_retries (
    id VARCHAR(36) PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    attempts INT NOT NULL DEFAULT 1,
    max_attempts INT NOT NULL DEFAULT 5,
    next_retry TIMESTAMP NOT NULL,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_retries_next_retry ON webhook_retries(next_retry); 