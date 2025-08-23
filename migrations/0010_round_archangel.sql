CREATE TABLE `user_addresses` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`country` text NOT NULL,
	`province` text NOT NULL,
	`city` text NOT NULL,
	`district` text,
	`street_address` text NOT NULL,
	`postal_code` text,
	`is_default` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`gender` text,
	`date_of_birth` integer,
	`avatar` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY NOT NULL,
	`price` real NOT NULL,
	`featured` integer DEFAULT false,
	`category_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "price", "featured", "category_id") SELECT "id", "price", "featured", "category_id" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_recipient_name` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_recipient_phone` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_country` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_province` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_city` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_district` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_street_address` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_postal_code` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `updated_at` integer NOT NULL;