-- Create SubscriptionPlans table
CREATE TABLE `subscriptionPlans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `interval` ENUM('MONTHLY', 'YEARLY') NOT NULL,
    `features` JSON NULL,
    `courseLimit` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptionPlans_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create UserSubscriptions table
CREATE TABLE `userSubscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'CANCELLED', 'EXPIRED') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `userSubscriptions_userId_idx`(`userId`),
    INDEX `userSubscriptions_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add subscriptionRequired field to Users table
ALTER TABLE `users` ADD COLUMN `subscriptionRequired` BOOLEAN NOT NULL DEFAULT false;

-- Add foreign key constraints
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscriptionPlans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default subscription plans
INSERT INTO `subscriptionPlans` (`id`, `name`, `description`, `price`, `interval`, `features`, `courseLimit`, `isActive`, `createdAt`, `updatedAt`) 
VALUES 
(UUID(), 'Free', 'Basic features with limited access', 0.00, 'MONTHLY', '["Create up to 3 courses", "Basic course generation", "Community support"]', 3, true, NOW(), NOW()),
(UUID(), 'Pro', 'Advanced features for professionals', 29.99, 'MONTHLY', '["Unlimited courses", "Priority course generation", "Priority support", "Advanced analytics"]', 999999, true, NOW(), NOW()),
(UUID(), 'Enterprise', 'Complete solution for organizations', 99.99, 'YEARLY', '["Unlimited courses", "Custom branding", "API access", "Dedicated support", "Team management"]', 999999, true, NOW(), NOW());
