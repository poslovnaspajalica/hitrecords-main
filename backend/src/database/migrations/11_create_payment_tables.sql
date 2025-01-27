CREATE TABLE payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_confirmation BOOLEAN DEFAULT false,
    config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    payment_method_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    payment_data JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE TABLE payment_confirmations (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL,
    confirmation_data JSON NOT NULL,
    status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Insert payment methods
INSERT INTO payment_methods (id, code, name, description, is_active, requires_confirmation, config) VALUES
(UUID(), 'cod', 'Plaćanje pouzećem', 'Platite gotovinom prilikom preuzimanja', true, false, '{}'),
(UUID(), 'bank_transfer', 'Plaćanje preko računa', 'Platite bankovnim transferom na naš račun', true, true, 
    '{"bank_account": "HR1234567890123456789", "bank_name": "Zagrebačka banka", "recipient": "Hit Music Shop d.o.o."}'),
(UUID(), 'paypal', 'PayPal', 'Platite sigurno putem PayPal-a', true, false, 
    '{"client_id": "YOUR_PAYPAL_CLIENT_ID", "client_secret": "YOUR_PAYPAL_SECRET", "mode": "sandbox"}'),
(UUID(), 'payway', 'Kreditne kartice (PayWay)', 'Platite kreditnom karticom putem PayWay sustava', true, false,
    '{"shop_id": "YOUR_SHOP_ID", "secret_key": "YOUR_SECRET_KEY", "mode": "test"}');

-- Add payment related columns to orders table
ALTER TABLE orders 
ADD COLUMN payment_method_id VARCHAR(36),
ADD COLUMN payment_due_date TIMESTAMP,
ADD FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id); 