import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import type { AppContext } from '../types';
import { RegisterSchema, LoginSchema } from '../types/schemas';
import { hashPassword } from '../utils';
import * as schema from '../db/schema';
import { users } from '../db/schema';

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
            lastLoginAt: new Date()
        }).returning({ id: users.id });

        if (!newUser || newUser.length === 0) {
            return c.json({ error: 'Failed to create user' }, 500);
        }

        const userId = newUser[0].id;
        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const token = await sign({ sub: userId.toString(), email }, secret);

        return c.json({ token, user: { id: userId, email } }, 201);
    } catch (e: any) {
        return c.json({ error: 'Registration failed', details: e.message }, 500);
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
        const token = await sign({ 
            sub: user.id.toString(), 
            email: user.email 
        }, secret);

        return c.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (e: any) {
        return c.json({ error: 'Login failed', details: e.message }, 500);
    }
});