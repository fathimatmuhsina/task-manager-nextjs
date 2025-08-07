/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `projects_userId_name_key` ON `projects`(`userId`, `name`);
