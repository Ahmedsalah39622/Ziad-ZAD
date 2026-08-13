-- Add manual product ordering
ALTER TABLE `Product`
    ADD COLUMN `sortOrder` INT NOT NULL DEFAULT 0;
