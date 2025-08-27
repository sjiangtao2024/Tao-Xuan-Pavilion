import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, count, lt } from 'drizzle-orm';
import type { AppContext } from '../types';
import { authMiddleware, adminMiddleware, superAdminMiddleware, logAdminAction } from '../middleware';
import { hashPassword } from '../utils';
import * as schema from '../db/schema';
import { 
    users, 
    orders, 
    products, 
    productTranslations, 
    adminLogs, 
    categories,
    categoryTranslations,
    mediaAssets,
    productMedia
} from '../db/schema';

export const adminRoutes = new Hono<AppContext>();

// 获取用户列表
adminRoutes.get('/users', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (search) {
            whereConditions.push(eq(users.email, `%${search}%`));
        }
        
        if (status) {
            whereConditions.push(eq(users.status, status));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const userList = await db.query.users.findMany({
            where: whereClause,
            columns: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLoginAt: true
            },
            limit,
            offset,
            orderBy: [desc(users.createdAt)]
        });
        
        const totalCountResult = await db.select({ count: count() })
            .from(users)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            users: userList,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get users', details: error.message }, 500);
    }
});

// 获取用户详情
adminRoutes.get('/users/:id', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                profile: true,
                addresses: true,
                orders: {
                    limit: 10,
                    orderBy: [desc(orders.createdAt)]
                }
            }
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        return c.json(user);
    } catch (error: any) {
        return c.json({ error: 'Failed to get user details', details: error.message }, 500);
    }
});

// 修改用户状态
adminRoutes.put('/users/:id/status', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const { status } = await c.req.json();
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (!['active', 'disabled', 'suspended'].includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }
    
    try {
        const updatedUser = await db.update(users)
            .set({ status, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        
        if ((updatedUser as any).length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        await logAdminAction(db, adminUser.id, 'update_user_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { oldStatus: 'unknown', newStatus: status });
        
        return c.json({ success: true, user: (updatedUser as any)[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update user status', details: error.message }, 500);
    }
});

// 删除用户 (软删除)
adminRoutes.delete('/users/:id', authMiddleware, superAdminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        if (['admin', 'super_admin', 'moderator'].includes(user.role)) {
            return c.json({ error: 'Cannot delete admin accounts' }, 403);
        }
        
        await db.update(users)
            .set({ status: 'deleted', updatedAt: new Date() })
            .where(eq(users.id, userId));
        
        await logAdminAction(db, adminUser.id, 'delete_user', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { email: user.email });
        
        return c.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete user', details: error.message }, 500);
    }
});

// 重置用户密码
adminRoutes.post('/users/:id/reset-password', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        const tempPassword = Math.random().toString(36).slice(-8) + 
                           Math.random().toString(36).slice(-4).toUpperCase();
        
        const hashedPassword = await hashPassword(tempPassword);
        
        const updateResult = await db.update(users)
            .set({ 
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
            
        if (!updateResult || (Array.isArray(updateResult) && updateResult.length === 0)) {
            return c.json({ 
                error: 'Failed to update password - no rows affected',
                debug: { userId, tempPassword, hashedPassword }
            }, 500);
        }
        
        await logAdminAction(db, adminUser.id, 'reset_password', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { email: user.email });
        
        return c.json({ 
            success: true, 
            message: 'Password reset successfully',
            tempPassword: tempPassword,
            email: user.email
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to reset password', details: error.message }, 500);
    }
});

// 获取订单列表
adminRoutes.get('/orders', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const status = c.req.query('status') || '';
    const userId = c.req.query('userId') || '';
    const startDate = c.req.query('startDate') || '';
    const endDate = c.req.query('endDate') || '';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (status) {
            whereConditions.push(eq(orders.status, status as any));
        }
        
        if (userId) {
            whereConditions.push(eq(orders.userId, Number(userId)));
        }
        
        if (startDate) {
            whereConditions.push(eq(orders.createdAt, new Date(startDate)));
        }
        
        if (endDate) {
            whereConditions.push(eq(orders.createdAt, new Date(endDate)));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const orderList = await db.query.orders.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: { id: true, email: true }
                },
                items: {
                    with: {
                        product: {
                            columns: { id: true, name: true, price: true },
                            with: {
                                translations: { 
                                    where: eq(productTranslations.language, 'en') 
                                }
                            }
                        }
                    }
                }
            },
            limit,
            offset,
            orderBy: [desc(orders.createdAt)]
        });
        
        const formattedOrders = orderList.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product'
                }
            }))
        }));
        
        const totalCountResult = await db.select({ count: count() })
            .from(orders)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get orders', details: error.message }, 500);
    }
});

// 修改订单状态
adminRoutes.put('/orders/:id/status', authMiddleware, adminMiddleware, async (c) => {
    const orderId = Number(c.req.param('id'));
    const { status, reason } = await c.req.json();
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }
    
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId)
        });
        
        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }
        
        const updatedOrder = await db.update(orders)
            .set({ status, updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning();
        
        await logAdminAction(db, adminUser.id, 'update_order_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'order', orderId, { oldStatus: order.status, newStatus: status, reason });
        
        return c.json({ success: true, order: updatedOrder[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update order status', details: error.message }, 500);
    }
});

// 获取管理员操作日志
adminRoutes.get('/logs', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const action = c.req.query('action') || '';
    const adminId = c.req.query('adminId') || '';
    const offset = (page - 1) * limit;
    
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        await db.delete(adminLogs)
            .where(lt(adminLogs.createdAt, ninetyDaysAgo));
        
        let whereConditions = [];
        
        if (action) {
            whereConditions.push(eq(adminLogs.action, action));
        }
        
        if (adminId) {
            whereConditions.push(eq(adminLogs.adminId, Number(adminId)));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const logList = await db.query.adminLogs.findMany({
            where: whereClause,
            with: {
                admin: {
                    columns: { id: true, email: true, role: true }
                }
            },
            limit,
            offset,
            orderBy: [desc(adminLogs.createdAt)]
        });
        
        const totalCountResult = await db.select({ count: count() })
            .from(adminLogs)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            logs: logList,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get admin logs', details: error.message }, 500);
    }
});

// 手动清理操作日志（仅超级管理员）
adminRoutes.delete('/logs/cleanup', authMiddleware, superAdminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const daysToKeep = Number(c.req.query('days')) || 30;
    
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const countResult = await db.select({ count: count() })
            .from(adminLogs)
            .where(lt(adminLogs.createdAt, cutoffDate));
        const deleteCount = countResult[0]?.count || 0;
        
        await db.delete(adminLogs)
            .where(lt(adminLogs.createdAt, cutoffDate));
        
        const adminUser = c.get('adminUser');
        await logAdminAction(db, adminUser.id, 'cleanup_logs', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
            'admin_logs', undefined, { 
                daysToKeep, 
                cutoffDate: cutoffDate.toISOString(), 
                deletedCount: deleteCount 
            });
        
        return c.json({ 
            success: true, 
            message: '清理完成，删除了 ' + deleteCount + ' 条' + daysToKeep + '天前的日志记录',
            deletedCount: deleteCount,
            cutoffDate: cutoffDate.toISOString()
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to cleanup logs', details: error.message }, 500);
    }
});

// 管理员仪表板统计
adminRoutes.get('/dashboard', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const totalUsers = await db.select({ count: count() }).from(users);
        const totalOrders = await db.select({ count: count() }).from(orders);
        const totalProducts = await db.select({ count: count() }).from(products);
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const newUsersThisMonth = await db.select({ count: count() })
            .from(users)
            .where(eq(users.createdAt, thisMonth));
        
        const orderStatusStats = await db.select({
            status: orders.status,
            count: count()
        }).from(orders).groupBy(orders.status);
        
        return c.json({
            totalUsers: totalUsers[0]?.count || 0,
            totalOrders: totalOrders[0]?.count || 0,
            totalProducts: totalProducts[0]?.count || 0,
            newUsersThisMonth: newUsersThisMonth[0]?.count || 0,
            orderStatusStats
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get dashboard data', details: error.message }, 500);
    }
});

// ========== 产品管理路由 ==========

// 获取产品列表
adminRoutes.get('/products', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const search = c.req.query('search') || '';
    const categoryId = c.req.query('categoryId') || '';
    const featured = c.req.query('featured') || '';
    const lang = c.req.query('lang') || 'zh';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (categoryId && !isNaN(Number(categoryId))) {
            whereConditions.push(eq(products.categoryId, Number(categoryId)));
        }
        
        if (featured === 'true') {
            whereConditions.push(eq(products.featured, true));
        } else if (featured === 'false') {
            whereConditions.push(eq(products.featured, false));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const productList = await db.query.products.findMany({
            where: whereClause,
            with: {
                translations: {
                    where: eq(productTranslations.language, lang)
                },
                category: {
                    with: {
                        translations: {
                            where: eq(categoryTranslations.language, lang)
                        }
                    }
                },
                media: {
                    with: {
                        asset: true
                    },
                    orderBy: [schema.productMedia.displayOrder],
                    limit: 1 // 只获取第一个媒体文件作为缩略图
                }
            },
            limit,
            offset,
            orderBy: [desc(products.id)]
        });
        
        // 格式化产品数据
        const formattedProducts = productList
            .filter(product => {
                if (!search) return true;
                const translation = product.translations[0];
                return translation && (
                    translation.name.toLowerCase().includes(search.toLowerCase()) ||
                    translation.description.toLowerCase().includes(search.toLowerCase())
                );
            })
            .map(product => ({
                id: product.id,
                name_zh: product.translations.find(t => t.language === 'zh')?.name || '',
                name_en: product.translations.find(t => t.language === 'en')?.name || '',
                description_zh: product.translations.find(t => t.language === 'zh')?.description || '',
                description_en: product.translations.find(t => t.language === 'en')?.description || '',
                price: product.price,
                featured: product.featured,
                categoryId: product.categoryId,
                categoryName: (product.category as any)?.translations?.[0]?.name || '',
                thumbnailUrl: product.media[0]?.asset?.url || null,
                mediaCount: product.media.length
            }));
        
        const totalCountResult = await db.select({ count: count() })
            .from(products)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get products', details: error.message }, 500);
    }
});

// 获取产品详情
adminRoutes.get('/products/:id', authMiddleware, adminMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }
    
    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                translations: true,
                category: {
                    with: {
                        translations: true
                    }
                },
                media: {
                    with: {
                        asset: true
                    },
                    orderBy: [schema.productMedia.displayOrder]
                }
            }
        });
        
        if (!product) {
            return c.json({ error: 'Product not found' }, 404);
        }
        
        // 格式化产品数据
        const formattedProduct = {
            id: product.id,
            name_zh: product.translations.find(t => t.language === 'zh')?.name || '',
            name_en: product.translations.find(t => t.language === 'en')?.name || '',
            description_zh: product.translations.find(t => t.language === 'zh')?.description || '',
            description_en: product.translations.find(t => t.language === 'en')?.description || '',
            price: product.price,
            featured: product.featured,
            categoryId: product.categoryId,
            category: product.category ? {
                id: (product.category as any).id,
                name_zh: (product.category as any).translations.find((t: any) => t.language === 'zh')?.name || '',
                name_en: (product.category as any).translations.find((t: any) => t.language === 'en')?.name || ''
            } : null,
            media: product.media.map(pm => ({
                id: pm.id,
                assetId: pm.assetId,
                url: pm.asset.url,
                type: pm.asset.mediaType,
                displayOrder: pm.displayOrder,
                is_thumbnail: pm.displayOrder === 0
            })),
            created_at: product.id, // 需要从数据库schema中添加时间戳字段
            updated_at: product.id
        };
        
        return c.json(formattedProduct);
    } catch (error: any) {
        return c.json({ error: 'Failed to get product details', details: error.message }, 500);
    }
});

// 创建产品
adminRoutes.post('/products', authMiddleware, adminMiddleware, async (c) => {
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const body = await c.req.json();
        const {
            name_zh,
            name_en = '',
            description_zh = '',
            description_en = '',
            price,
            categoryId,
            featured = false,
            media = []
        } = body;
        
        // 验证必填字段
        if (!name_zh || !price || price <= 0) {
            return c.json({ error: 'Missing required fields: name_zh and valid price' }, 400);
        }
        
        // 创建产品
        const newProductResult = await db.insert(products).values({
            price: Number(price),
            featured: Boolean(featured),
            categoryId: categoryId ? Number(categoryId) : null
        }).returning({ insertedId: products.id });
        
        const newProductId = newProductResult[0]?.insertedId;
        if (!newProductId) {
            throw new Error('Failed to create product');
        }
        
        // 插入翻译
        const translations = [];
        if (name_zh) {
            translations.push({
                productId: newProductId,
                language: 'zh',
                name: name_zh,
                description: description_zh
            });
        }
        
        if (name_en) {
            translations.push({
                productId: newProductId,
                language: 'en',
                name: name_en,
                description: description_en
            });
        }
        
        if (translations.length > 0) {
            await db.insert(productTranslations).values(translations);
        }
        
        // 处理媒体文件
        if (media && media.length > 0) {
            const mediaLinks = media.map((m: any, index: number) => ({
                productId: newProductId,
                assetId: m.assetId || m.id,
                displayOrder: m.is_thumbnail ? 0 : index + 1
            }));
            
            await db.insert(productMedia).values(mediaLinks);
        }
        
        // 记录管理员操作日志
        await logAdminAction(
            db,
            adminUser.id,
            'create_product',
            c.req.header('CF-Connecting-IP'),
            c.req.header('User-Agent'),
            'product',
            newProductId,
            { name_zh, price }
        );
        
        return c.json({
            success: true,
            productId: newProductId,
            message: 'Product created successfully'
        }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create product', details: error.message }, 500);
    }
});

// 更新产品
adminRoutes.put('/products/:id', authMiddleware, adminMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }
    
    try {
        const body = await c.req.json();
        const {
            name_zh,
            name_en = '',
            description_zh = '',
            description_en = '',
            price,
            categoryId,
            featured,
            media = []
        } = body;
        
        // 检查产品是否存在
        const existingProduct = await db.query.products.findFirst({
            where: eq(products.id, productId)
        });
        
        if (!existingProduct) {
            return c.json({ error: 'Product not found' }, 404);
        }
        
        // 更新产品基本信息
        await db.update(products)
            .set({
                price: price ? Number(price) : existingProduct.price,
                featured: featured !== undefined ? Boolean(featured) : existingProduct.featured,
                categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existingProduct.categoryId
            })
            .where(eq(products.id, productId));
        
        // 更新或插入翻译
        const languages = ['zh', 'en'];
        const translationData = {
            zh: { name: name_zh, description: description_zh },
            en: { name: name_en, description: description_en }
        };
        
        for (const lang of languages) {
            const data = translationData[lang as keyof typeof translationData];
            if (data.name) {
                const existingTranslation = await db.query.productTranslations.findFirst({
                    where: and(
                        eq(productTranslations.productId, productId),
                        eq(productTranslations.language, lang)
                    )
                });
                
                if (existingTranslation) {
                    await db.update(productTranslations)
                        .set({ name: data.name, description: data.description })
                        .where(eq(productTranslations.id, existingTranslation.id));
                } else {
                    await db.insert(productTranslations).values({
                        productId,
                        language: lang,
                        name: data.name,
                        description: data.description
                    });
                }
            }
        }
        
        // 更新媒体文件关联
        if (media && Array.isArray(media)) {
            // 删除现有的媒体关联
            await db.delete(productMedia).where(eq(productMedia.productId, productId));
            
            // 插入新的媒体关联
            if (media.length > 0) {
                const mediaLinks = media.map((m: any, index: number) => ({
                    productId,
                    assetId: m.assetId || m.id,
                    displayOrder: m.is_thumbnail ? 0 : index + 1
                }));
                
                await db.insert(productMedia).values(mediaLinks);
            }
        }
        
        // 记录管理员操作日志
        await logAdminAction(
            db,
            adminUser.id,
            'update_product',
            c.req.header('CF-Connecting-IP'),
            c.req.header('User-Agent'),
            'product',
            productId,
            { name_zh, price }
        );
        
        return c.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to update product', details: error.message }, 500);
    }
});

// 删除产品
adminRoutes.delete('/products/:id', authMiddleware, adminMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }
    
    try {
        // 检查产品是否存在
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                translations: {
                    where: eq(productTranslations.language, 'zh')
                }
            }
        });
        
        if (!product) {
            return c.json({ error: 'Product not found' }, 404);
        }
        
        // 删除产品（级联删除将处理关联的翻译和媒体关联）
        await db.delete(products).where(eq(products.id, productId));
        
        // 记录管理员操作日志
        await logAdminAction(
            db,
            adminUser.id,
            'delete_product',
            c.req.header('CF-Connecting-IP'),
            c.req.header('User-Agent'),
            'product',
            productId,
            {
                name: product.translations[0]?.name || 'Unknown Product',
                price: product.price
            }
        );
        
        return c.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete product', details: error.message }, 500);
    }
});

// 获取产品媒体文件
adminRoutes.get('/products/:id/media', authMiddleware, adminMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }
    
    try {
        const mediaList = await db.query.productMedia.findMany({
            where: eq(productMedia.productId, productId),
            with: {
                asset: true
            },
            orderBy: [schema.productMedia.displayOrder]
        });
        
        const formattedMedia = mediaList.map(pm => ({
            id: pm.id,
            assetId: pm.assetId,
            url: (pm.asset as any).url,
            type: (pm.asset as any).mediaType,
            filename: (pm.asset as any).r2Key,
            size: (pm.asset as any).size,
            displayOrder: pm.displayOrder,
            is_thumbnail: pm.displayOrder === 0
        }));
        
        return c.json({ media: formattedMedia });
    } catch (error: any) {
        return c.json({ error: 'Failed to get product media', details: error.message }, 500);
    }
});

// 上传媒体文件
adminRoutes.post('/media/upload', authMiddleware, adminMiddleware, async (c) => {
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const formData = await c.req.formData();
        const file = formData.get('file') as unknown as File;
        const type = formData.get('type') as string;
        const productId = formData.get('product_id') as string;
        
        if (!file) {
            return c.json({ error: 'No file provided' }, 400);
        }
        
        // 验证文件类型
        const allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
        };
        
        const mediaType = type === 'video' ? 'video' : 'image';
        if (!allowedTypes[mediaType].includes(file.type)) {
            return c.json({ error: 'Unsupported file type' }, 400);
        }
        
        // 验证文件大小（10MB限制）
        if (file.size > 10 * 1024 * 1024) {
            return c.json({ error: 'File too large (max 10MB)' }, 400);
        }
        
        // 计算文件哈希
        const fileBuffer = await file.arrayBuffer();
        const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
        const hashHex = Array.from(new Uint8Array(hashArray))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        // 检查是否已存在相同文件
        let asset = await db.query.mediaAssets.findFirst({
            where: eq(mediaAssets.hash, hashHex)
        });
        
        let assetId: number;
        
        if (asset) {
            // 文件已存在，直接使用
            assetId = asset.id;
        } else {
            // 上传新文件到R2
            const bucket = mediaType === 'image' ? c.env.IMAGES_BUCKET : c.env.VIDEOS_BUCKET;
            const r2Key = `${Date.now()}-${file.name}`;
            
            await bucket.put(r2Key, fileBuffer, {
                httpMetadata: {
                    contentType: file.type
                }
            });
            
            // 保存到数据库
            const newAssetResult = await db.insert(mediaAssets).values({
                hash: hashHex,
                r2Key,
                size: file.size,
                mediaType,
                url: `/media/${r2Key}`
            }).returning({ id: mediaAssets.id });
            
            assetId = newAssetResult[0].id;
        }
        
        // 如果提供了产品ID，创建关联
        if (productId && !isNaN(Number(productId))) {
            await db.insert(productMedia).values({
                productId: Number(productId),
                assetId,
                displayOrder: 999 // 默认排在最后
            });
        }
        
        // 记录管理员操作日志
        await logAdminAction(
            db,
            adminUser.id,
            'upload_media',
            c.req.header('CF-Connecting-IP'),
            c.req.header('User-Agent'),
            'media_asset',
            assetId,
            {
                filename: file.name,
                size: file.size,
                type: mediaType,
                productId: productId || null
            }
        );
        
        return c.json({
            success: true,
            id: assetId,
            url: `/media/${asset?.r2Key || `${Date.now()}-${file.name}`}`,
            type: mediaType,
            message: 'File uploaded successfully'
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to upload file', details: error.message }, 500);
    }
});

// 删除媒体文件
adminRoutes.delete('/media/:id', authMiddleware, adminMiddleware, async (c) => {
    const mediaId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(mediaId)) {
        return c.json({ error: 'Invalid media ID' }, 400);
    }
    
    try {
        // 查找媒体关联记录
        const mediaLink = await db.query.productMedia.findFirst({
            where: eq(productMedia.id, mediaId),
            with: {
                asset: true
            }
        });
        
        if (!mediaLink) {
            return c.json({ error: 'Media not found' }, 404);
        }
        
        // 删除产品媒体关联
        await db.delete(productMedia).where(eq(productMedia.id, mediaId));
        
        // 检查是否还有其他产品使用此资源
        const otherUsage = await db.query.productMedia.findFirst({
            where: eq(productMedia.assetId, mediaLink.assetId)
        });
        
        // 如果没有其他使用，删除资源文件
        if (!otherUsage) {
            // 从R2删除文件
            const bucket = (mediaLink.asset as any).mediaType === 'image' ? 
                c.env.IMAGES_BUCKET : c.env.VIDEOS_BUCKET;
            
            try {
                await bucket.delete((mediaLink.asset as any).r2Key);
            } catch (r2Error) {
                console.warn('Failed to delete file from R2:', r2Error);
            }
            
            // 从数据库删除资源记录
            await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaLink.assetId));
        }
        
        // 记录管理员操作日志
        await logAdminAction(
            db,
            adminUser.id,
            'delete_media',
            c.req.header('CF-Connecting-IP'),
            c.req.header('User-Agent'),
            'product_media',
            mediaId,
            {
                assetId: mediaLink.assetId,
                productId: mediaLink.productId,
                url: (mediaLink.asset as any).url
            }
        );
        
        return c.json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete media', details: error.message }, 500);
    }
});

// ========== 分类管理路由 ==========

// 获取分类列表
adminRoutes.get('/categories', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'zh';
    
    try {
        const categoriesData = await db.query.categories.findMany({
            with: {
                translations: { where: eq(categoryTranslations.language, lang) }
            }
        });
        
        const formattedCategories = categoriesData.map(cat => ({
            id: cat.id,
            name_zh: cat.translations.find(t => t.language === 'zh')?.name || '',
            name_en: cat.translations.find(t => t.language === 'en')?.name || '',
            name: cat.translations[0]?.name || 'Unknown Category'
        }));
        
        return c.json(formattedCategories);
    } catch (error: any) {
        return c.json({ error: 'Failed to get categories', details: error.message }, 500);
    }
});

// 创建分类
adminRoutes.post('/categories', authMiddleware, adminMiddleware, async (c) => {
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const { name_zh, name_en = '' } = await c.req.json();
        
        if (!name_zh) {
            return c.json({ error: 'Chinese name is required' }, 400);
        }
        
        // 创建分类
        const newCategoryResult = await db.insert(categories).values({}).returning({ id: categories.id });
        const categoryId = newCategoryResult[0].id;
        
        // 插入翻译
        const translations = [];
        if (name_zh) translations.push({ categoryId, language: 'zh', name: name_zh });
        if (name_en) translations.push({ categoryId, language: 'en', name: name_en });
        
        await db.insert(categoryTranslations).values(translations);
        
        await logAdminAction(db, adminUser.id, 'create_category', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'category', categoryId, { name_zh, name_en });
        
        return c.json({ success: true, categoryId, message: 'Category created successfully' }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create category', details: error.message }, 500);
    }
});

// 更新分类
adminRoutes.put('/categories/:id', authMiddleware, adminMiddleware, async (c) => {
    const categoryId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(categoryId)) {
        return c.json({ error: 'Invalid category ID' }, 400);
    }
    
    try {
        const { name_zh, name_en = '' } = await c.req.json();
        
        // 检查分类是否存在
        const existingCategory = await db.query.categories.findFirst({
            where: eq(categories.id, categoryId)
        });
        
        if (!existingCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }
        
        // 更新翻译
        const languages = ['zh', 'en'];
        const translationData = { zh: name_zh, en: name_en };
        
        for (const lang of languages) {
            const name = translationData[lang as keyof typeof translationData];
            if (name) {
                const existing = await db.query.categoryTranslations.findFirst({
                    where: and(eq(categoryTranslations.categoryId, categoryId), eq(categoryTranslations.language, lang))
                });
                
                if (existing) {
                    await db.update(categoryTranslations).set({ name }).where(eq(categoryTranslations.id, existing.id));
                } else {
                    await db.insert(categoryTranslations).values({ categoryId, language: lang, name });
                }
            }
        }
        
        await logAdminAction(db, adminUser.id, 'update_category',
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
            'category', categoryId, { name_zh, name_en });
        
        return c.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to update category', details: error.message }, 500);
    }
});

// 删除分类
adminRoutes.delete('/categories/:id', authMiddleware, adminMiddleware, async (c) => {
    const categoryId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (isNaN(categoryId)) {
        return c.json({ error: 'Invalid category ID' }, 400);
    }
    
    try {
        // 检查分类是否存在
        const category = await db.query.categories.findFirst({
            where: eq(categories.id, categoryId),
            with: { translations: { where: eq(categoryTranslations.language, 'zh') } }
        });
        
        if (!category) {
            return c.json({ error: 'Category not found' }, 404);
        }
        
        // 清除使用此分类的产品的categoryId
        await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, categoryId));
        
        // 删除分类（级联删除将处理翻译）
        await db.delete(categories).where(eq(categories.id, categoryId));
        
        await logAdminAction(db, adminUser.id, 'delete_category',
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
            'category', categoryId, { name: category.translations[0]?.name || 'Unknown' });
        
        return c.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete category', details: error.message }, 500);
    }
});