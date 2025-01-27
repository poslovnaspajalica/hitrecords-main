CREATE TABLE shipment_tracking_events (
    id VARCHAR(36) PRIMARY KEY,
    shipment_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id)
);

CREATE INDEX idx_tracking_events_shipment ON shipment_tracking_events(shipment_id);
CREATE INDEX idx_tracking_events_timestamp ON shipment_tracking_events(timestamp); 