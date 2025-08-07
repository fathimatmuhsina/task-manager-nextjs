/*
  Warnings:

  - You are about to drop the column `projectId` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `categories_projectId_fkey`;

-- DropIndex
DROP INDEX `categories_projectId_name_key` ON `categories`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `projectId`;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `categories_name_key` ON `categories`(`name`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
