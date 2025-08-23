import { sqliteTable, integer, text, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users Table: Stores user credentials and information.
export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(), // This will store the hashed password
    role: text('role', { enum: ['user', 'admin', 'super_admin', 'moderator'] }).default('user'),
    status: text('status', { enum: ['active', 'disabled', 'suspended', 'deleted'] }).default('active'),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    createdBy: integer('created_by').references(() => users.id),
});

// User Profiles Table: Stores extended user profile information
export const userProfiles = sqliteTable('user_profiles', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    gender: text('gender', { enum: ['male', 'female', 'other'] }),
    dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
    avatar: text('avatar'), // URL to avatar image
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// User Addresses Table: Stores user shipping addresses
export const userAddresses = sqliteTable('user_addresses', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(), // e.g., "Home", "Office"
    recipientName: text('recipient_name').notNull(),
    recipientPhone: text('recipient_phone').notNull(),
    country: text('country').notNull(),
    province: text('province').notNull(),
    city: text('city').notNull(),
    district: text('district'),
    streetAddress: text('street_address').notNull(),
    postalCode: text('postal_code'),
    isDefault: integer('is_default', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Categories Table: Stores product categories
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
});

// Category Translations Table: Stores translated category names
export const categoryTranslations = sqliteTable('category_translations', {
  id: integer('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  language: text('language').notNull(), // Language code (e.g., 'en', 'zh')
  name: text('name').notNull(), // Translated category name
});

// Products Table: Stores information about each product available for sale.
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(), // Unique identifier for the product
  price: real('price').notNull(), // Price of the product in USD (base currency)
  featured: integer('featured', { mode: 'boolean' }).default(false), // Whether the product is featured on the homepage
  categoryId: integer('category_id').references(() => categories.id), // Foreign key to categories table
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
  status: text('status', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  // Shipping address fields (snapshot of address at time of order)
  shippingRecipientName: text('shipping_recipient_name'),
  shippingRecipientPhone: text('shipping_recipient_phone'),
  shippingCountry: text('shipping_country'),
  shippingProvince: text('shipping_province'),
  shippingCity: text('shipping_city'),
  shippingDistrict: text('shipping_district'),
  shippingStreetAddress: text('shipping_street_address'),
  shippingPostalCode: text('shipping_postal_code'),
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

// Admin Logs Table: Stores admin operation audit logs
export const adminLogs = sqliteTable('admin_logs', {
    id: integer('id').primaryKey(),
    adminId: integer('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: integer('target_id'),
    details: text('details'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});


// --- RELATIONS ---
export const usersRelations = relations(users, ({ many, one }) => ({
    orders: many(orders),
    cart: one(carts),
    profile: one(userProfiles),
    addresses: many(userAddresses),
    adminLogs: many(adminLogs),
    createdByUser: one(users, { fields: [users.createdBy], references: [users.id] }),
    createdUsers: many(users, { foreignKey: users.createdBy }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
    user: one(users, {
        fields: [userAddresses.userId],
        references: [users.id],
    }),
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

export const categoriesRelations = relations(categories, ({ many }) => ({
    translations: many(categoryTranslations),
    products: many(products),
}));

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
    category: one(categories, {
        fields: [categoryTranslations.categoryId],
        references: [categories.id],
    }),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
    translations: many(productTranslations),
    orderItems: many(orderItems),
    cartItems: many(cartItems),
    media: many(productMedia),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
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

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
    admin: one(users, {
        fields: [adminLogs.adminId],
        references: [users.id],
    }),
}));
