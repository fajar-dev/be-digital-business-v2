CREATE TABLE employee (
    id INT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo_profile VARCHAR(255) NOT NULL,
    job_position VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    job_level VARCHAR(50) NOT NULL,
    branch VARCHAR(255) NOT NULL,
    manager_id INT NULL,
    has_dashboard BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE snapshots (
    ai INT PRIMARY KEY,
    invoice_number BIGINT NULL,
    sequence_number INT NULL,
    paid_date DATE NULL,
    subscription DECIMAL(15, 2) NULL,
    status ENUM('new', 'upgrade', 'termin', 'recurring', 'prorate') NOT NULL DEFAULT 'recurring',
    month_period DECIMAL(15, 1) NULL,
    total_account INT NULL,
    customer_id VARCHAR(20) NULL,
    customer_service_id INT NULL,
    customer_company VARCHAR(255) NULL,
    contract_until_date DATE NULL,
    service_group_id VARCHAR(20) NULL,
    service_id VARCHAR(20) NULL,
    service_name VARCHAR(255) NULL,
    service_type ENUM('internal', 'resell') NOT NULL,
    cross_sell_count INT NOT NULL DEFAULT 0,
    sales_id VARCHAR(20) NULL,
    manager_sales_id VARCHAR(20) NULL,
    implementator_id VARCHAR(20) NULL,
    modal DECIMAL(15, 2) NULL
);