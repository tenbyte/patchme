-- CreateTable
CREATE TABLE `System` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hostname` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `lastSeen` DATETIME(3) NULL,
    `variables` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SystemBaselines` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SystemBaselines_AB_unique`(`A`, `B`),
    INDEX `_SystemBaselines_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SystemTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SystemTags_AB_unique`(`A`, `B`),
    INDEX `_SystemTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_SystemBaselines` ADD CONSTRAINT `_SystemBaselines_A_fkey` FOREIGN KEY (`A`) REFERENCES `Baseline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SystemBaselines` ADD CONSTRAINT `_SystemBaselines_B_fkey` FOREIGN KEY (`B`) REFERENCES `System`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SystemTags` ADD CONSTRAINT `_SystemTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `System`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SystemTags` ADD CONSTRAINT `_SystemTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
