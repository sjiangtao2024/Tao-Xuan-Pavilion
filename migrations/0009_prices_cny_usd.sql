-- Recreate products table with price_cny and price_usd
CREATE TABLE `products_new` (
    `id` integer PRIMARY KEY NOT NULL,
    `price_cny` real NOT NULL,
    `price_usd` real NOT NULL,
    `featured` integer DEFAULT false,
    `category_id` integer REFERENCES categories(id)
);
--> statement-breakpoint
-- Assuming old price was in CNY and using a placeholder exchange rate of 7.25 for USD
INSERT INTO `products_new` (id, price_cny, price_usd, featured, category_id)
SELECT id, price, price / 7.25, featured, category_id FROM `products`;
--> statement-breakpoint
DROP TABLE `products`;
--> statement-breakpoint
ALTER TABLE `products_new` RENAME TO `products`;
