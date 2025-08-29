import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { AppContext } from '../types';
import { CreateProductSchema, UpdateProductSchema } from '../types/schemas';
import { authMiddleware } from '../middleware';
import { hash } from '../utils';
import * as schema from '../db/schema';
import { 
    products, 
    productTranslations, 
    categories, 
    categoryTranslations, 
    productMedia, 
    mediaAssets 
} from '../db/schema';
import { ServerDebug } from '../utils/debug';

export const productRoutes = new Hono<AppContext>();

// 获取所有产品
productRoutes.get('/', async (c) => {
    try {
        ServerDebug.debug('products', 'Product list request received');
        const db = drizzle(c.env.DB, { schema });
        const lang = c.req.query('lang') || 'en';
        const categoryId = c.req.query('categoryId');
        
        ServerDebug.log('products', 'Query params:', { lang, categoryId });
        
        let whereCondition;
        if (categoryId && !isNaN(Number(categoryId))) {
            whereCondition = eq(products.categoryId, Number(categoryId));
        }
        
        ServerDebug.log('products', 'Querying database...');
        const results = await db.query.products.findMany({ 
            where: whereCondition,
            with: { 
                media: { 
                    with: { asset: true }, 
                    orderBy: [schema.productMedia.displayOrder] 
                }, 
                translations: { 
                    where: eq(productTranslations.language, lang) 
                },
                category: {
                    with: {
                        translations: { 
                            where: eq(categoryTranslations.language, lang) 
                        }
                    }
                }
            } 
        });
        
        ServerDebug.log('products', `Found ${results.length} products`);
        
        const formatted = results.map(p => ({ 
            ...p, 
            name: p.translations[0]?.name, 
            description: p.translations[0]?.description,
            categoryName: (p.category as any)?.translations?.[0]?.name,
            price: p.price
        }));
        
        ServerDebug.success('products', 'Product list response ready');
        return c.json(formatted);
    } catch (error: any) {
        ServerDebug.error('products', 'Product list error:', error);
        return c.json({ 
            error: 'Failed to fetch products', 
            details: error.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
});

// 创建产品
productRoutes.post('/', authMiddleware, async (c) => {
    const body = await c.req.json();
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    }
    
    const { price, featured, categoryId, name, description, lang } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const newProductResult = await db.insert(products).values({ 
            price, 
            featured, 
            categoryId 
        }).returning({ insertedId: products.id });
        
        const newProductId = newProductResult[0]?.insertedId;
        if (!newProductId) throw new Error("Failed to create product.");
        
        await db.insert(productTranslations).values({ 
            productId: newProductId, 
            language: lang, 
            name, 
            description 
        });
        
        const finalProduct = await db.query.products.findFirst({ 
            where: eq(products.id, newProductId), 
            with: { media: true, translations: true } 
        });
        
        return c.json(finalProduct, 201);
    } catch (e: any) {
        return c.json({ error: 'Failed to create product', details: e.message }, 500);
    }
});

// 获取产品分类
productRoutes.get('/categories', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    
    const categoriesData = await db.query.categories.findMany({
        with: {
            translations: { where: eq(categoryTranslations.language, lang) }
        }
    });
    
    const formattedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.translations[0]?.name || 'Unknown Category'
    }));
    
    return c.json(formattedCategories);
});

// 获取单个产品
productRoutes.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    
    const lang = c.req.query('lang') || 'en';
    const db = drizzle(c.env.DB, { schema });
    
    const product = await db.query.products.findFirst({ 
        where: eq(products.id, id), 
        with: { 
            media: { 
                with: { asset: true }, 
                orderBy: [schema.productMedia.displayOrder] 
            }, 
            translations: { 
                where: eq(productTranslations.language, lang) 
            },
            category: {
                with: {
                    translations: { 
                        where: eq(categoryTranslations.language, lang) 
                    }
                }
            }
        } 
    });
    
    if (!product) return c.json({ error: 'Product not found' }, 404);
    
    const formatted = { 
        ...product, 
        name: product.translations[0]?.name, 
        description: product.translations[0]?.description,
        categoryName: (product.category as any)?.translations?.[0]?.name,
        price: product.price
    };
    
    return c.json(formatted);
});

// 更新产品
productRoutes.patch('/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    
    const lang = c.req.query('lang') || 'en';
    const body = await c.req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    }
    
    const { price, featured, categoryId, name, description } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const productUpdateData: any = {};
        if (price !== undefined) productUpdateData.price = price;
        if (featured !== undefined) productUpdateData.featured = featured;
        if (categoryId !== undefined) productUpdateData.categoryId = categoryId;
        
        if (Object.keys(productUpdateData).length > 0) {
            await db.update(products).set(productUpdateData).where(eq(products.id, id));
        }
        
        const translationUpdateData: any = {};
        if (name !== undefined) translationUpdateData.name = name;
        if (description !== undefined) translationUpdateData.description = description;
        
        if (Object.keys(translationUpdateData).length > 0) {
            const existing = await db.query.productTranslations.findFirst({ 
                where: and(
                    eq(productTranslations.productId, id), 
                    eq(productTranslations.language, lang)
                ) 
            });
            
            if (existing) {
                await db.update(productTranslations)
                    .set(translationUpdateData)
                    .where(eq(productTranslations.id, existing.id));
            } else {
                await db.insert(productTranslations).values({ 
                    productId: id, 
                    language: lang, 
                    name: name || '', 
                    description: description || '' 
                });
            }
        }
        
        const updatedProduct = await db.query.products.findFirst({ 
            where: eq(products.id, id), 
            with: { media: true, translations: true } 
        });
        
        return c.json(updatedProduct);
    } catch (e: any) {
        return c.json({ error: 'Failed to update product', details: e.message }, 500);
    }
});

// 删除产品
productRoutes.delete('/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        await db.delete(products).where(eq(products.id, id));
        return c.json({ message: 'Product deleted successfully' });
    } catch (e: any) {
        return c.json({ error: 'Failed to delete product', details: e.message }, 500);
    }
});

// 设置产品缩略图
productRoutes.post('/:productId/media/:mediaLinkId/set-thumbnail', authMiddleware, async (c) => {
    const productId = Number(c.req.param('productId'));
    const mediaLinkId = Number(c.req.param('mediaLinkId'));
    
    if (isNaN(productId) || isNaN(mediaLinkId)) {
        return c.json({ error: 'Invalid ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    try {
        await db.update(productMedia)
            .set({ displayOrder: 1 })
            .where(eq(productMedia.productId, productId));

        await db.update(productMedia)
            .set({ displayOrder: 0 })
            .where(and(
                eq(productMedia.id, mediaLinkId), 
                eq(productMedia.productId, productId)
            ));

        const updatedProduct = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                media: { 
                    with: { asset: true }, 
                    orderBy: [schema.productMedia.displayOrder] 
                },
                translations: { 
                    where: eq(productTranslations.language, 'en') 
                }
            }
        });

        return c.json(updatedProduct);
    } catch (e: any) {
        console.error('Failed to set thumbnail:', e);
        return c.json({ error: 'Failed to set thumbnail', details: e.message }, 500);
    }
});

// 上传产品媒体文件
productRoutes.post('/:id/media', authMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });
    const formData = await c.req.formData();
    
    const imageFiles = formData.getAll('image');
    const videoFiles = formData.getAll('video');
    const files = [...imageFiles, ...videoFiles]
        .filter(f => f && typeof f === 'object' && 'name' in f) as unknown as File[];

    if (files.length === 0) {
        return c.json({ error: 'No media files provided' }, 400);
    }

    for (const file of files) {
        const mediaType = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' : null;
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
                const r2Key = `${Date.now()}-${file.name}`;
                await bucket.put(r2Key, fileBuffer);

                const newAsset = await db.insert(mediaAssets).values({
                    r2Key,
                    url: `/media/${r2Key}`,
                    mediaType,
                    hash: fileHash,
                    filename: file.name,
                    fileSize: fileBuffer.byteLength,
                    mimeType: file.type,
                }).returning({ id: mediaAssets.id });

                assetId = newAsset[0].id;
            }

            await db.insert(productMedia).values({
                productId,
                assetId,
                displayOrder: 999,
            });
        } catch (e) {
            console.error(`Failed to process file ${file.name}:`, e);
        }
    }

    const updatedProduct = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
            media: { 
                with: { asset: true }, 
                orderBy: [schema.productMedia.displayOrder] 
            }
        }
    });

    return c.json(updatedProduct);
});