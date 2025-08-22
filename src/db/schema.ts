import { sqliteTable, integer, text, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users Table: Stores user credentials and information.
export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(), // This will store the hashed password
});

// Products Table: Stores information about each product available for sale.
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(), // Unique identifier for the product
  price: real('price').notNull(), // Price of the product
  featured: integer('featured', { mode: 'boolean' }).default(false), // Whether the product is featured on the homepage
  category: text('category').notNull().default('Uncategorized'), // The original, single-language category field
});

// Product Translations Table: Stores translated product information
export const productTranslations = sqliteTable('product_translations', {
  id: integer('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  language: text('language').notNull(), // Language code (e.g., 'en', 'zh')
  name: text('name').notNull(), // Translated name of the product
  description: text('description').notNull(), // Translated description of the product
});

// MediaAssets Table: Central repository for unique media files, identified by a hash.
export const mediaAssets = sqliteTable('media_assets', {
    id: integer('id').primaryKey(),
    hash: text('hash').notNull().unique(), // SHA-256 hash of the file content
    r2Key: text('r2_key').notNull(), // The unique key (filename) in the R2 bucket
    size: integer('size').notNull(), // File size in bytes
    mediaType: text('media_type', { enum: ['image', 'video'] }).notNull(),
    url: text('url').notNull(), // The relative or absolute URL to the asset
}, (table) => ({
    hashIdx: uniqueIndex('hash_idx').on(table.hash),
}));

// ProductMedia Table: Links products to media assets.
export const productMedia = sqliteTable('product_media', {
    id: integer('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    assetId: integer('asset_id').notNull().references(() => mediaAssets.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0),
});

// Orders and related tables
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'shipped', 'cancelled'] }).default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    pricePerItem: real('price_per_item').notNull(),
});

export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const cartItems = sqliteTable('cart_items', {
    id: integer('id').primaryKey(),
    cartId: integer('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
});


// --- RELATIONS ---
export const usersRelations = relations(users, ({ many, one }) => ({
    orders: many(orders),
    cart: one(carts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(orderItems),
  user: one(users, {
      fields: [orders.userId],
      references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
    translations: many(productTranslations),
    orderItems: many(orderItems),
    cartItems: many(cartItems),
    media: many(productMedia),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
    product: one(products, {
        fields: [productTranslations.productId],
        references: [products.id],
    }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
    user: one(users, {
        fields: [carts.userId],
        references: [users.id],
    }),
    items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
    product: one(products, {
        fields: [productMedia.productId],
        references: [products.id],
    }),
    asset: one(mediaAssets, {
        fields: [productMedia.assetId],
        references: [mediaAssets.id],
    }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ many }) => ({
    productLinks: many(productMedia),
}));
