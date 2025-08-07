/*
  Warnings:

  - A unique constraint covering the columns `[projectId,title]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tasks_projectId_title_key` ON `tasks`(`projectId`, `title`);
