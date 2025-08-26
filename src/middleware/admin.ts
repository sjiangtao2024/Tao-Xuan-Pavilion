import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import type { AppContext, AdminUser } from '../types';
import * as schema from '../db/schema';
import { users } from '../db/schema';

/**
 * 记录管理员操作日志
 */
export async function logAdminAction(
    db: any,
    adminId: number,
    action: string,
    ipAddress?: string,
    userAgent?: string,
    targetType?: string,
    targetId?: number,
    details?: any
) {
    try {
        await db.insert(schema.adminLogs).values({
            adminId,
            action,
            targetType: targetType || 'system',
            targetId: targetId || null,
            details: details ? JSON.stringify(details) : null,
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

/**
 * 管理员权限验证中间件
 */
export const adminMiddleware = async (c: Context<AppContext>, next: () => Promise<void>) => {
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ error: 'Authentication required' }, 401);
    }
    
    const db = drizzle(c.env.DB, { schema });
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, email: true, role: true, status: true }
    });
    
    if (!user || !['admin', 'super_admin', 'moderator'].includes(user.role)) {
        return c.json({ error: 'Admin access required' }, 403);
    }
    
    if (user.status !== 'active') {
        return c.json({ error: 'Account disabled' }, 403);
    }
    
    c.set('adminUser', user as AdminUser);
    
    // 记录管理员操作日志
    const action = `${c.req.method} ${c.req.path}`;
    await logAdminAction(
        db,
        user.id,
        action,
        c.req.header('CF-Connecting-IP'),
        c.req.header('User-Agent')
    );
    
    await next();
};

/**
 * 超级管理员权限验证中间件
 */
export const superAdminMiddleware = async (c: Context<AppContext>, next: () => Promise<void>) => {
    const adminUser = c.get('adminUser');
    if (!adminUser || adminUser.role !== 'super_admin') {
        return c.json({ error: 'Super admin access required' }, 403);
    }
    await next();
};