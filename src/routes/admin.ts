import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, count, lt } from 'drizzle-orm';
import type { AppContext } from '../types';
import { authMiddleware, adminMiddleware, superAdminMiddleware, logAdminAction } from '../middleware';
import { hashPassword } from '../utils';
import * as schema from '../db/schema';
import { users, orders, products, adminLogs, productTranslations } from '../db/schema';

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
            
        if (!updateResult || updateResult.length === 0) {
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