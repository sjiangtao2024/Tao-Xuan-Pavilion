CREATE TABLE `product_media` (
	`id` integer PRIMARY KEY NOT NULL,
	`product_id` integer NOT NULL,
	`media_type` text NOT NULL,
	`url` text NOT NULL,
	`display_order` integer DEFAULT 0,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `image_url`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `video_url`;