import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { AppContext } from '../types';
import { RegisterSchema, LoginSchema } from '../types/schemas';
import { hashPassword, generateEmailAuthToken, generateOAuthToken, verifyToken } from '../utils';
import { authMiddleware } from '../middleware';
import * as schema from '../db/schema';
import { users, oauthSessions } from '../db/schema';

export const authRoutes = new Hono<AppContext>();

// 用户注册
authRoutes.post('/register', async (c) => {
    const body = await c.req.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    }

    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });

    try {
        const existingUser = await db.query.users.findFirst({ 
            where: eq(users.email, email) 
        });
        if (existingUser) {
            return c.json({ error: 'Email already exists' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await db.insert(users).values({ 
            email, 
            password: hashedPassword,
            authMethod: 'email',
            emailVerified: false, // 需要邮箱验证
            lastLoginAt: new Date()
        }).returning({ id: users.id, email: users.email, role: users.role, status: users.status });

        if (!newUser || newUser.length === 0) {
            return c.json({ error: 'Failed to create user' }, 500);
        }

        const user = newUser[0];
        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const token = await generateEmailAuthToken(user, secret);

        return c.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                authMethod: 'email',
                emailVerified: false
            } 
        }, 201);
    } catch (e: any) {
        return c.json({ error: 'Registration failed', details: e.message }, 500);
    }
});

// 管理员登录 - 专门用于管理界面
authRoutes.post('/admin-login', async (c) => {
    const body = await c.req.json();
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    }

    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });

    try {
        const user = await db.query.users.findFirst({ 
            where: eq(users.email, email) 
        });
        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        if (user.status !== 'active') {
            return c.json({ error: 'Account is disabled' }, 403);
        }

        // 检查管理员权限
        if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'moderator') {
            return c.json({ error: 'Access denied: Insufficient privileges' }, 403);
        }

        // 更新最后登录时间
        await db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const token = await generateEmailAuthToken({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified ?? true // 管理员默认已验证
        }, secret);

        return c.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                authMethod: 'email'
            } 
        });
    } catch (e: any) {
        return c.json({ error: 'Login failed', details: e.message }, 500);
    }
});

// 用户登录
authRoutes.post('/login', async (c) => {
    const body = await c.req.json();
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    }

    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });

    try {
        const user = await db.query.users.findFirst({ 
            where: eq(users.email, email) 
        });
        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return c.json({ error: 'Invalid credentials' }, 400);
        }

        if (user.status !== 'active') {
            return c.json({ error: 'Account is disabled' }, 403);
        }

        // 更新最后登录时间
        await db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const token = await generateEmailAuthToken({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified ?? false
        }, secret);

        return c.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                authMethod: user.authMethod || 'email',
                emailVerified: user.emailVerified ?? false
            } 
        });
    } catch (e: any) {
        return c.json({ error: 'Login failed', details: e.message }, 500);
    }
});

// 获取当前用户信息的处理函数
const getUserInfo = async (c: any) => {
    const userId = c.get('userId');
    
    if (!userId) {
        return c.json({ error: 'User not found' }, 404);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLoginAt: true
            }
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 返回符合前端期望的格式
        return c.json({ success: true, user });
    } catch (e: any) {
        return c.json({ error: 'Failed to get user info', details: e.message }, 500);
    }
};

// 获取当前用户信息
authRoutes.get('/me', authMiddleware, getUserInfo);

// 兼容前端的 /profile 端点
authRoutes.get('/profile', authMiddleware, getUserInfo);

// 用户登出 - 不需要认证，因为登出应该总是可以执行
authRoutes.post('/logout', async (c) => {
    try {
        // 尝试从Authorization header中获取用户信息（如果有的话）
        const authHeader = c.req.header('Authorization');
        let userId = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const secret = c.env.JWT_SECRET || 'a-very-secret-key';
                const payload = await verifyToken(token, secret);
                userId = parseInt(payload.sub, 10);
            } catch (error) {
                // Token无效，但这不应该阻止登出
                console.log('Token invalid during logout, but continuing logout process');
            }
        }
        
        // 如果能获取到userId，清理OAuth会话
        if (userId) {
            try {
                const db = drizzle(c.env.DB, { schema });
                await db.delete(oauthSessions)
                    .where(eq(oauthSessions.userId, userId));
                console.log(`User ${userId} logged out`);
            } catch (dbError) {
                console.error('Failed to cleanup OAuth sessions:', dbError);
                // 数据库清理失败不应该影响登出成功
            }
        }
        
        return c.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (e: any) {
        console.error('Logout error:', e);
        // 登出始终返回成功，即使出错
        return c.json({ 
            success: true, 
            message: 'Logged out' 
        });
    }
});

// Google OAuth 回调处理
authRoutes.post('/oauth/google', async (c) => {
    const body = await c.req.json();
    const { googleToken, googleUser } = body;
    
    if (!googleToken || !googleUser || !googleUser.email) {
        return c.json({ error: 'Invalid Google OAuth data' }, 400);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查是否已存在用户（通过Google ID或邮箱）
        let user = await db.query.users.findFirst({ 
            where: eq(users.googleId, googleUser.id)
        });
        
        if (!user) {
            // 检查是否存在相同邮箱的用户
            user = await db.query.users.findFirst({ 
                where: eq(users.email, googleUser.email)
            });
            
            if (user) {
                // 用户存在但未绑定Google，更新用户信息
                const updatedUsers = await db.update(users)
                    .set({
                        googleId: googleUser.id,
                        oauthProvider: 'google',
                        oauthPicture: googleUser.picture,
                        authMethod: 'oauth',
                        emailVerified: true,
                        lastLoginAt: new Date()
                    })
                    .where(eq(users.id, user.id))
                    .returning();
                
                if (updatedUsers.length > 0) {
                    user = updatedUsers[0] as typeof user;
                }
            } else {
                // 创建新用户
                const newUsers = await db.insert(users).values({
                    email: googleUser.email,
                    googleId: googleUser.id,
                    oauthProvider: 'google',
                    oauthPicture: googleUser.picture,
                    authMethod: 'oauth',
                    emailVerified: true,
                    role: 'user',
                    status: 'active',
                    lastLoginAt: new Date()
                }).returning();
                
                if (newUsers.length > 0) {
                    user = newUsers[0] as typeof user;
                }
            }
        } else {
            // 更新最后登录时间
            await db.update(users)
                .set({ lastLoginAt: new Date() })
                .where(eq(users.id, user.id));
        }
        
        if (!user) {
            return c.json({ error: 'Failed to create or update user' }, 500);
        }
        
        if (user.status !== 'active') {
            return c.json({ error: 'Account is disabled' }, 403);
        }
        
        // 保存或更新OAuth会话信息
        try {
            await db.insert(oauthSessions).values({
                userId: user.id,
                provider: 'google',
                providerUserId: googleUser.id,
                accessToken: googleToken,
                scope: 'email profile',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } catch (conflictError) {
            // 如果存在冲突，更新现有记录
            await db.update(oauthSessions)
                .set({
                    accessToken: googleToken,
                    updatedAt: new Date()
                })
                .where(eq(oauthSessions.providerUserId, googleUser.id));
        }
        
        // 生成JWT token
        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const token = await generateOAuthToken(
            {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
                status: user.status || 'active'
            },
            {
                provider: 'google',
                googleId: googleUser.id,
                picture: googleUser.picture
            },
            secret
        );
        
        return c.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
                authMethod: 'oauth',
                oauthProvider: 'google',
                picture: googleUser.picture,
                emailVerified: true
            }
        });
        
    } catch (e: any) {
        console.error('Google OAuth error:', e);
        return c.json({ error: 'OAuth authentication failed', details: e.message }, 500);
    }
});

// Token刷新端点
authRoutes.post('/refresh', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !userId) {
        return c.json({ error: 'Invalid request' }, 400);
    }
    
    const oldToken = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || 'a-very-secret-key';
    
    try {
        const { refreshToken } = await import('../utils/jwt');
        const newToken = await refreshToken(oldToken, secret);
        
        return c.json({ 
            success: true, 
            token: newToken 
        });
    } catch (e: any) {
        return c.json({ error: 'Token refresh failed', details: e.message }, 401);
    }
});