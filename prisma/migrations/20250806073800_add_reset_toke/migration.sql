/*
  Warnings:

  - You are about to drop the `time_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `time_entries` DROP FOREIGN KEY `time_entries_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `time_entries` DROP FOREIGN KEY `time_entries_userId_fkey`;

-- DropTable
DROP TABLE `time_entries`;

-- CreateTable
CREATE TABLE `reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reset_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
