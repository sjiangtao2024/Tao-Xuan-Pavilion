import { verifyToken } from '../utils/jwt';
import type { Context } from 'hono';
import type { AppContext } from '../types';

/**
 * 用户认证中间件
 */
export const authMiddleware = async (c: Context<AppContext>, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || 'a-very-secret-key';

    try {
        const payload = await verifyToken(token, secret);
        c.set('userId', parseInt(payload.sub, 10));
        c.set('userEmail', payload.email);
        c.set('userRole', payload.role);
        c.set('authMethod', payload.authMethod);
        await next();
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};