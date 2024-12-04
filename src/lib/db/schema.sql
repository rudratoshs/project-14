-- Create database
CREATE DATABASE IF NOT EXISTS ai_course_generator;
USE ai_course_generator;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
('1', 'admin', 'Administrator with full access'),
('2', 'student', 'Regular student user');

-- Insert default permissions
INSERT INTO permissions (id, name, description) VALUES
('1', 'create_course', 'Can create new courses'),
('2', 'edit_course', 'Can edit existing courses'),
('3', 'delete_course', 'Can delete courses'),
('4', 'view_course', 'Can view courses'),
('5', 'manage_users', 'Can manage user accounts'),
('6', 'manage_roles', 'Can manage roles and permissions');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
('1', '1'), -- Admin can create courses
('1', '2'), -- Admin can edit courses
('1', '3'), -- Admin can delete courses
('1', '4'), -- Admin can view courses
('1', '5'), -- Admin can manage users
('1', '6'), -- Admin can manage roles
('2', '4'); -- Student can view courses

-- Create default admin user (password: admin123)
INSERT INTO users (id, name, email, password, role_id) VALUES
('1', 'Admin User', 'admin@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '1');