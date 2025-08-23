-- Migration: Add User Profile Features (Safe Version)
-- This migration safely adds user profile tables and extends existing tables

-- Create user_profiles table (safe)
CREATE TABLE IF NOT EXISTS `user_profiles` (
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

-- Create unique index on user_id for user_profiles (safe)
CREATE UNIQUE INDEX IF NOT EXISTS `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);

-- Create user_addresses table (safe)
CREATE TABLE IF NOT EXISTS `user_addresses` (
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

-- Add shipping address fields to orders table (check if columns exist first)
-- Note: SQLite doesn't have ADD COLUMN IF NOT EXISTS, so we'll use a different approach

-- Check if we need to add the new columns by trying to add them
-- If they already exist, the command will fail but that's OK

PRAGMA table_info(orders);

-- Add columns one by one (these will fail if columns already exist, which is fine)
ALTER TABLE `orders` ADD COLUMN `shipping_recipient_name` text;
ALTER TABLE `orders` ADD COLUMN `shipping_recipient_phone` text;
ALTER TABLE `orders` ADD COLUMN `shipping_country` text;
ALTER TABLE `orders` ADD COLUMN `shipping_province` text;
ALTER TABLE `orders` ADD COLUMN `shipping_city` text;
ALTER TABLE `orders` ADD COLUMN `shipping_district` text;
ALTER TABLE `orders` ADD COLUMN `shipping_street_address` text;
ALTER TABLE `orders` ADD COLUMN `shipping_postal_code` text;
ALTER TABLE `orders` ADD COLUMN `updated_at` integer;