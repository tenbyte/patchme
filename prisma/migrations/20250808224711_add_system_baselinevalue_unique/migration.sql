/*
  Warnings:

  - A unique constraint covering the columns `[systemId,baselineId]` on the table `SystemBaselineValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SystemBaselineValue_systemId_baselineId_key` ON `SystemBaselineValue`(`systemId`, `baselineId`);
