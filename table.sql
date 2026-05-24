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
