-- CreateTable
CREATE TABLE `SystemBaselineValue` (
    `id` VARCHAR(191) NOT NULL,
    `systemId` VARCHAR(191) NOT NULL,
    `baselineId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SystemBaselineValue` ADD CONSTRAINT `SystemBaselineValue_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `System`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SystemBaselineValue` ADD CONSTRAINT `SystemBaselineValue_baselineId_fkey` FOREIGN KEY (`baselineId`) REFERENCES `Baseline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
