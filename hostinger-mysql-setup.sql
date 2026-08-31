-- =========================================================
-- ABSOLUTE GYM - HOSTINGER MYSQL DATABASE SETUP SCRIPT
-- Compatible with Hostinger hPanel & phpMyAdmin
-- =========================================================

-- 1. Create Gym Configuration Table
CREATE TABLE IF NOT EXISTS `gym_config` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY DEFAULT 'main',
  `data` LONGTEXT NOT NULL COMMENT 'Complete Gym CMS JSON Configuration',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` VARCHAR(20) DEFAULT '1.0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Member Leads & Inquiries Table
CREATE TABLE IF NOT EXISTS `gym_leads` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'Trial Pass',
  `plan_name` VARCHAR(100) DEFAULT NULL,
  `trainer_name` VARCHAR(100) DEFAULT NULL,
  `preferred_time` VARCHAR(50) DEFAULT NULL,
  `fitness_goal` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'new',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Admin Staff Table (Optional PIN/Email login authentication)
CREATE TABLE IF NOT EXISTS `gym_admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `pin` VARCHAR(255) NOT NULL DEFAULT '1234',
  `role` VARCHAR(50) NOT NULL DEFAULT 'superadmin',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account if not exists
INSERT INTO `gym_admins` (`email`, `pin`, `role`)
VALUES ('mukeshgorai30@gmail.com', '1234', 'superadmin')
ON DUPLICATE KEY UPDATE `role`='superadmin';
