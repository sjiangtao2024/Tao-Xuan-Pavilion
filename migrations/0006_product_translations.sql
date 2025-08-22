CREATE TABLE `product_translations` (
	`id` integer PRIMARY KEY NOT NULL,
	`product_id` integer NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_translations_product_id_language_unique` ON `product_translations` (`product_id`, `language`);