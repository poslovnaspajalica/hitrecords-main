CREATE TABLE daily_reports (
    id VARCHAR(36) PRIMARY KEY,
    date DATE NOT NULL,
    metrics JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

CREATE TABLE shipment_issues_archive (
    id VARCHAR(36) PRIMARY KEY,
    shipment_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE shipments ADD COLUMN delivery_order INT NULL; 