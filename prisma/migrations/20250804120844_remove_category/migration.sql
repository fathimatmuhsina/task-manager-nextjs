/*
  Warnings:

  - You are about to drop the column `categoryId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_categoryId_fkey`;

-- DropIndex
DROP INDEX `projects_categoryId_fkey` ON `projects`;

-- DropIndex
DROP INDEX `tasks_categoryId_fkey` ON `tasks`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `categoryId`;

-- AlterTable
ALTER TABLE `tasks` DROP COLUMN `categoryId`;

-- DropTable
DROP TABLE `categories`;
