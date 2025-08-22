CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category_translations` (
	`id` integer PRIMARY KEY NOT NULL,
	`category_id` integer NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `products` ADD `category_id` integer REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `category`;