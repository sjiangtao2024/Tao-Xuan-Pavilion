CREATE TABLE `media_assets` (
	`id` integer PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`r2_key` text NOT NULL,
	`size` integer NOT NULL,
	`media_type` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_hash_unique` ON `media_assets` (`hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `hash_idx` ON `media_assets` (`hash`);--> statement-breakpoint
ALTER TABLE `product_media` ADD `asset_id` integer NOT NULL REFERENCES media_assets(id);--> statement-breakpoint
ALTER TABLE `product_media` DROP COLUMN `media_type`;--> statement-breakpoint
ALTER TABLE `product_media` DROP COLUMN `url`;