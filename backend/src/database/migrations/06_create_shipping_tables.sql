-- Shipping providers
CREATE TABLE shipping_providers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping rates
CREATE TABLE shipping_rates (
    id VARCHAR(36) PRIMARY KEY,
    provider_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    min_weight DECIMAL(8, 2),
    max_weight DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES shipping_providers(id)
);

-- Shipments
CREATE TABLE shipments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    tracking_number VARCHAR(100),
    label_url VARCHAR(255),
    status VARCHAR(50),
    shipping_rate_id VARCHAR(36) NOT NULL,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (provider_id) REFERENCES shipping_providers(id),
    FOREIGN KEY (shipping_rate_id) REFERENCES shipping_rates(id)
);

-- Insert default shipping providers
INSERT INTO shipping_providers (id, name, code) VALUES
(UUID(), 'Hrvatska Pošta', 'hp_express'),
(UUID(), 'DHL', 'dhl'),
(UUID(), 'Overseas Express', 'overseas'),
(UUID(), 'BoxNow', 'boxnow'); 