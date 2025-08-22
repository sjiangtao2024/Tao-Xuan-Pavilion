-- Modify the products table to remove name and description columns
CREATE TABLE `products_new` (
	`id` integer PRIMARY KEY NOT NULL,
	`price` real NOT NULL,
	`featured` integer DEFAULT false,
	`category` text DEFAULT 'Uncategorized' NOT NULL
);
--> statement-breakpoint
INSERT INTO `products_new` SELECT `id`, `price`, `featured`, `category` FROM `products`;
--> statement-breakpoint
DROP TABLE `products`;
--> statement-breakpoint
ALTER TABLE `products_new` RENAME TO `products`;