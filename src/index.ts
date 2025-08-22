import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';
import { products, users, carts, cartItems, productMedia, mediaAssets, productTranslations } from './db/schema';
import { and, eq, desc, count } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt'
import { z } from 'zod';
import { cors } from 'hono/cors';

import html from './frontend.html';

export interface Env {
	DB: D1Database;
    JWT_SECRET: string;
    IMAGES_BUCKET: R2Bucket;
    VIDEOS_BUCKET: R2Bucket;
    IS_PROD?: string;
}

interface JWTPayload {
    sub: string;
    email: string;
    exp: number;
}

const RegisterSchema = z.object({ 
    email: z.string().email(), 
    password: z.string().min(8) 
});

const LoginSchema = z.object({ 
    email: z.string().email(), 
    password: z.string() 
});

const AddToCartSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
});

const UpdateCartSchema = z.object({
    quantity: z.number().int().min(1),
});

const CreateProductSchema = z.object({
    price: z.number().positive(),
    featured: z.boolean().optional().default(false),
    category: z.string().min(1).optional().default('Uncategorized'),
    name: z.string().min(1),
    description: z.string().min(1),
    lang: z.string().optional().default('en')
});

const UpdateProductSchema = z.object({
    price: z.number().positive().optional(),
    featured: z.boolean().optional(),
    category: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

async function hash(data: ArrayBuffer, algorithm = 'SHA-256') {
    const hash = await crypto.subtle.digest(algorithm, data);
    return bufferToHex(hash);
}

async function hashPassword(password: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    return await hash(data);
}

function bufferToHex(buffer: ArrayBuffer) {
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const generateUniqueFilename = (filename: string) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}-${filename}`;
};

const app = new Hono<{ Bindings: Env, Variables: { userId: number } }>();

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'], credentials: true }));

// 主页路由
app.get('/', (c) => c.html(html));

// 静态文件服务 - API文档
app.get('/api/docs', (c) => {
    const swaggerUI = `
<!DOCTYPE html>
<html>
<head>
    <title>Tao Ecommerce API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
    return c.html(swaggerUI);
});

// OpenAPI JSON 文档
app.get('/openapi.json', async (c) => {
    try {
        // 读取openapi.json文件内容
        const openApiSpec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Tao Ecommerce API",
                "version": "1.0.0",
                "description": "API for Tao Ecommerce application"
            },
            "servers": [
                {
                    "url": "/api",
                    "description": "API Server"
                }
            ],
            "components": {
                "securitySchemes": {
                    "BearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                },
                "schemas": {
                    "Product": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "name": { "type": "string" },
                            "description": { "type": "string" },
                            "price": { "type": "number" },
                            "category": { "type": "string" },
                            "featured": { "type": "boolean" },
                            "media": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "integer" },
                                        "url": { "type": "string" },
                                        "mediaType": { "type": "string", "enum": ["image", "video"] }
                                    }
                                }
                            }
                        }
                    },
                    "User": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "email": { "type": "string" }
                        }
                    },
                    "Cart": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "userId": { "type": "integer" },
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "integer" },
                                        "productId": { "type": "integer" },
                                        "quantity": { "type": "integer" },
                                        "product": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "paths": {
                "/products": {
                    "get": {
                        "summary": "Get all products",
                        "parameters": [
                            {
                                "name": "lang",
                                "in": "query",
                                "description": "Language code (en/zh)",
                                "schema": { "type": "string", "default": "en" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "List of products",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": { "$ref": "#/components/schemas/Product" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "post": {
                        "summary": "Create a new product",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["name", "description", "price"],
                                        "properties": {
                                            "name": { "type": "string" },
                                            "description": { "type": "string" },
                                            "price": { "type": "number" },
                                            "category": { "type": "string", "default": "Uncategorized" },
                                            "featured": { "type": "boolean", "default": false },
                                            "lang": { "type": "string", "default": "en" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": {
                                "description": "Product created",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input" },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/products/categories": {
                    "get": {
                        "summary": "Get all product categories",
                        "responses": {
                            "200": {
                                "description": "List of categories",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/products/{id}": {
                    "get": {
                        "summary": "Get product by ID",
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            },
                            {
                                "name": "lang",
                                "in": "query",
                                "description": "Language code (en/zh)",
                                "schema": { "type": "string", "default": "en" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Product details",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "404": { "description": "Product not found" }
                        }
                    },
                    "patch": {
                        "summary": "Update product",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "name": { "type": "string" },
                                            "description": { "type": "string" },
                                            "price": { "type": "number" },
                                            "category": { "type": "string" },
                                            "featured": { "type": "boolean" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Product updated",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Product not found" }
                        }
                    }
                },
                "/auth/register": {
                    "post": {
                        "summary": "Register a new user",
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["email", "password"],
                                        "properties": {
                                            "email": { "type": "string", "format": "email" },
                                            "password": { "type": "string", "minLength": 8 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": { "description": "User registered successfully" },
                            "400": { "description": "Invalid input" },
                            "409": { "description": "User already exists" }
                        }
                    }
                },
                "/auth/login": {
                    "post": {
                        "summary": "Login user",
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["email", "password"],
                                        "properties": {
                                            "email": { "type": "string", "format": "email" },
                                            "password": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Login successful",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "token": { "type": "string" },
                                                "user": {
                                                    "type": "object",
                                                    "properties": {
                                                        "id": { "type": "integer" },
                                                        "email": { "type": "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Invalid credentials" }
                        }
                    }
                },
                "/cart": {
                    "get": {
                        "summary": "Get user cart",
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "User cart",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Cart" }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/cart/items": {
                    "post": {
                        "summary": "Add item to cart",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["productId"],
                                        "properties": {
                                            "productId": { "type": "integer" },
                                            "quantity": { "type": "integer", "default": 1 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Item added to cart",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Cart" }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/cart/items/{itemId}": {
                    "put": {
                        "summary": "Update cart item quantity",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "itemId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["quantity"],
                                        "properties": {
                                            "quantity": { "type": "integer", "minimum": 1 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": { "description": "Cart item updated" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Cart item not found" }
                        }
                    },
                    "delete": {
                        "summary": "Remove item from cart",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "itemId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": { "description": "Cart item removed" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Cart item not found" }
                        }
                    }
                }
            }
        };
        
        return c.json(openApiSpec);
    } catch (error) {
        return c.json({ error: 'Failed to load API documentation' }, 500);
    }
});

app.get('/media/:key', async (c) => {
    const key = c.req.param('key');
    
    // Check image bucket first
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    // If not found, check video bucket
    if (object === null) {
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        return c.json({ error: 'Media not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
        headers,
    });
});

const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || 'a-very-secret-key';
    try {
        const decodedPayload = await verify(token, secret);
        c.set('userId', parseInt((decodedPayload as any).sub, 10));
        await next();
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};

app.get('/api/products', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    const results = await db.query.products.findMany({ with: { media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] }, translations: { where: eq(productTranslations.language, lang) } } });
    const formatted = results.map(p => ({ ...p, name: p.translations[0]?.name, description: p.translations[0]?.description }));
    return c.json(formatted);
});

app.post('/api/products', authMiddleware, async (c) => {
    const body = await c.req.json();
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    const { price, featured, category, name, description, lang } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    try {
        const newProductResult = await db.insert(products).values({ price, featured, category }).returning({ insertedId: products.id });
        const newProductId = newProductResult[0]?.insertedId;
        if (!newProductId) throw new Error("Failed to create product.");
        await db.insert(productTranslations).values({ productId: newProductId, language: lang, name, description });
        const finalProduct = await db.query.products.findFirst({ where: eq(products.id, newProductId), with: { media: true, translations: true } });
        return c.json(finalProduct, 201);
    } catch (e: any) {
        return c.json({ error: 'Failed to create product', details: e.message }, 500);
    }
});

app.get('/api/products/categories', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const categories = await db.selectDistinct({ category: products.category }).from(products);
    return c.json(categories.map(c => c.category));
});

app.get('/api/products/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    const lang = c.req.query('lang') || 'en';
    const db = drizzle(c.env.DB, { schema });
    const product = await db.query.products.findFirst({ where: eq(products.id, id), with: { media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] }, translations: { where: eq(productTranslations.language, lang) } } });
    if (!product) return c.json({ error: 'Product not found' }, 404);
    const p = { ...product, name: product.translations[0]?.name, description: product.translations[0]?.description };
    return c.json(p);
});

app.patch('/api/products/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    const lang = c.req.query('lang') || 'en';
    const body = await c.req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    const { price, featured, category, name, description } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    try {
        const productUpdateData: any = {};
        if (price !== undefined) productUpdateData.price = price;
        if (featured !== undefined) productUpdateData.featured = featured;
        if (category !== undefined) productUpdateData.category = category;
        if (Object.keys(productUpdateData).length > 0) {
            await db.update(products).set(productUpdateData).where(eq(products.id, id));
        }
        const translationUpdateData: any = {};
        if (name !== undefined) translationUpdateData.name = name;
        if (description !== undefined) translationUpdateData.description = description;
        if (Object.keys(translationUpdateData).length > 0) {
            const existing = await db.query.productTranslations.findFirst({ where: and(eq(productTranslations.productId, id), eq(productTranslations.language, lang)) });
            if (existing) {
                await db.update(productTranslations).set(translationUpdateData).where(eq(productTranslations.id, existing.id));
            } else {
                await db.insert(productTranslations).values({ productId: id, language: lang, name: name || '', description: description || '' });
            }
        }
        const updatedProduct = await db.query.products.findFirst({ where: eq(products.id, id), with: { media: true, translations: true } });
        return c.json(updatedProduct);
    } catch (e: any) {
        return c.json({ error: 'Failed to update product', details: e.message }, 500);
    }
});

app.post('/api/products/:productId/media/:mediaLinkId/set-thumbnail', authMiddleware, async (c) => {
    const productId = Number(c.req.param('productId'));
    const mediaLinkId = Number(c.req.param('mediaLinkId'));
    if (isNaN(productId) || isNaN(mediaLinkId)) {
        return c.json({ error: 'Invalid ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    try {
        // Set all media for this product to a higher displayOrder
        await db.update(productMedia)
            .set({ displayOrder: 1 })
            .where(eq(productMedia.productId, productId));

        // Set the selected media to be the thumbnail (displayOrder = 0)
        await db.update(productMedia)
            .set({ displayOrder: 0 })
            .where(and(eq(productMedia.id, mediaLinkId), eq(productMedia.productId, productId)));

        const updatedProduct = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] },
                translations: { where: eq(productTranslations.language, 'en') }
            }
        });

        return c.json(updatedProduct);
    } catch (e: any) {
        console.error('Failed to set thumbnail:', e);
        return c.json({ error: 'Failed to set thumbnail', details: e.message }, 500);
    }
});

app.post('/api/products/:id/media', authMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });
    const formData = await c.req.formData();
    
    const imageFiles = formData.getAll('image');
    const videoFiles = formData.getAll('video');
    const files = [...imageFiles, ...videoFiles].filter(f => f instanceof File) as File[];

    if (files.length === 0) {
        return c.json({ error: 'No media files provided' }, 400);
    }

    for (const file of files) {
        const mediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (!mediaType) {
            console.warn(`Skipping unsupported file type: ${file.type}`);
            continue; 
        }

        const bucket = mediaType === 'image' ? c.env.IMAGES_BUCKET : c.env.VIDEOS_BUCKET;
        const fileBuffer = await file.arrayBuffer();
        const fileHash = await hash(fileBuffer);

        try {
            let asset = await db.query.mediaAssets.findFirst({
                where: eq(mediaAssets.hash, fileHash),
            });

            let assetId: number;

            if (asset) {
                assetId = asset.id;
            } else {
                const r2Key = generateUniqueFilename(file.name);
                await bucket.put(r2Key, fileBuffer);
                const url = `/media/${r2Key}`;

                const newAsset = await db.insert(mediaAssets).values({
                    hash: fileHash,
                    r2Key: r2Key,
                    size: file.size,
                    mediaType: mediaType,
                    url: url,
                }).returning({ id: mediaAssets.id });
                
                assetId = newAsset[0].id;
            }

            const lastMedia = await db.query.productMedia.findFirst({
                where: eq(productMedia.productId, productId),
                orderBy: [desc(productMedia.displayOrder)],
            });
            const displayOrder = lastMedia ? lastMedia.displayOrder + 1 : 0;

            await db.insert(productMedia).values({
                productId: productId,
                assetId: assetId,
                displayOrder: displayOrder,
            }).returning();

        } catch (e: any) {
            console.error(`Failed to upload file ${file.name}:`, e);
            return c.json({ error: `Failed to process file ${file.name}`, details: e.message }, 500);
        }
    }
    
    const updatedProduct = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
            media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] },
            translations: { where: eq(productTranslations.language, 'en') } 
        }
    });

    return c.json(updatedProduct, 201);
});

// Other routes like media, auth, cart etc. would follow

// 认证路由
app.post('/api/auth/register', async (c) => {
    const body = await c.req.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid registration data', issues: validation.error.issues }, 400);
    
    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否已存在
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (existingUser) return c.json({ error: 'User already exists' }, 409);
        
        // 创建新用户
        const hashedPassword = await hashPassword(password);
        const newUser = await db.insert(users).values({ email, password: hashedPassword }).returning({ id: users.id });
        
        return c.json({ message: 'User registered successfully' }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to register user', details: error.message }, 500);
    }
});

app.post('/api/auth/login', async (c) => {
    const body = await c.req.json();
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid login data', issues: validation.error.issues }, 400);
    
    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 查找用户
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) return c.json({ error: 'Invalid credentials' }, 401);
        
        // 验证密码
        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password) return c.json({ error: 'Invalid credentials' }, 401);
        
        // 生成JWT
        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const payload = { sub: user.id.toString(), email: user.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) };
        const token = await sign(payload, secret);
        
        return c.json({ 
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Login failed', details: error.message }, 500);
    }
});

app.get('/api/auth/me', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, email: true }
    });

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
});

// 购物车路由
app.get('/api/cart', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 查找或创建购物车
        let cart = await db.query.carts.findFirst({ 
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { where: eq(productTranslations.language, 'en') }
                            }
                        }
                    }
                }
            }
        });
        
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId }).returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                items: [], 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        // 格式化产品数据
        if (cart && cart.items) {
            (cart as any).items = cart.items.map((item: any) => ({
                ...item,
                product: item.product ? {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    description: item.product.translations[0]?.description || ''
                } : null
            }));
        }
        
        return c.json(cart);
    } catch (error: any) {
        return c.json({ error: 'Failed to get cart', details: error.message }, 500);
    }
});

app.post('/api/cart/items', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validation = AddToCartSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid cart item data', issues: validation.error.issues }, 400);
    
    const { productId, quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 确保购物车存在
        let cart: any = await db.query.carts.findFirst({ where: eq(carts.userId, userId) });
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId }).returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        // 检查商品是否已在购物车中
        const existingItem = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
        });
        
        if (existingItem) {
            // 更新数量
            await db.update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            // 添加新商品
            await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
        }
        
        // 返回更新后的购物车
        const updatedCart = await db.query.carts.findFirst({ 
            where: eq(carts.id, cart.id),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { where: eq(productTranslations.language, 'en') }
                            }
                        }
                    }
                }
            }
        });
        
        return c.json(updatedCart);
    } catch (error: any) {
        return c.json({ error: 'Failed to add item to cart', details: error.message }, 500);
    }
});

app.put('/api/cart/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const body = await c.req.json();
    const validation = UpdateCartSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    
    const { quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证用户权限并更新
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || cartItem.cart.userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item updated successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to update cart item', details: error.message }, 500);
    }
});

app.delete('/api/cart/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证用户权限并删除
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || cartItem.cart.userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item removed successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to remove cart item', details: error.message }, 500);
    }
});

export default app;