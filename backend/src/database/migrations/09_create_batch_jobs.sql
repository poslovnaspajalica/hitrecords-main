CREATE TABLE batch_jobs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO batch_jobs (id, name, cron_expression) VALUES
(UUID(), 'update_active_shipments', '*/15 * * * *'),  -- Svakih 15 minuta
(UUID(), 'check_delayed_shipments', '0 */1 * * *'),   -- Svaki sat
(UUID(), 'cleanup_old_events', '0 0 * * *'),          -- Svaki dan u ponoć
(UUID(), 'generate_daily_report', '0 1 * * *'),       -- Svaki dan u 1:00
(UUID(), 'optimize_delivery_routes', '0 6 * * *');     -- Svaki dan u 6:00 