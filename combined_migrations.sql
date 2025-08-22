CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price_per_item` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`image` text,
	`featured` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`cart_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `carts_user_id_unique` ON `carts` (`user_id`);
ALTER TABLE `products` ADD `category` text DEFAULT 'Uncategorized' NOT NULL;
ALTER TABLE `products` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `image`;
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