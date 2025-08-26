import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { AppContext } from '../types';
import { AddToCartSchema, UpdateCartSchema } from '../types/schemas';
import { authMiddleware } from '../middleware';
import * as schema from '../db/schema';
import { carts, cartItems, productTranslations } from '../db/schema';

export const cartRoutes = new Hono<AppContext>();

// 获取用户购物车
cartRoutes.get('/', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const lang = c.req.query('lang') || 'en';
    const db = drizzle(c.env.DB, { schema });
    
    try {
        let cart = await db.query.carts.findFirst({ 
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { 
                                    where: eq(productTranslations.language, lang) 
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId })
                .returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                items: [], 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        if (cart && cart.items) {
            (cart as any).items = cart.items.map((item: any) => ({
                ...item,
                product: item.product ? {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    description: item.product.translations[0]?.description || '',
                    price: item.product.price
                } : null
            }));
        }
        
        return c.json(cart);
    } catch (error: any) {
        return c.json({ error: 'Failed to get cart', details: error.message }, 500);
    }
});

// 添加商品到购物车
cartRoutes.post('/items', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const lang = c.req.query('lang') || 'en';
    const body = await c.req.json();
    const validation = AddToCartSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid cart item data', issues: validation.error.issues }, 400);
    }
    
    const { productId, quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        let cart: any = await db.query.carts.findFirst({ 
            where: eq(carts.userId, userId) 
        });
        
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId })
                .returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        const existingItem = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.cartId, cart.id), 
                eq(cartItems.productId, productId)
            )
        });
        
        if (existingItem) {
            await db.update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            await db.insert(cartItems).values({ 
                cartId: cart.id, 
                productId, 
                quantity 
            });
        }
        
        const updatedCart = await db.query.carts.findFirst({ 
            where: eq(carts.id, cart.id),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { 
                                    where: eq(productTranslations.language, lang) 
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (updatedCart && updatedCart.items) {
            (updatedCart as any).items = updatedCart.items.map((item: any) => ({
                ...item,
                product: item.product ? {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    description: item.product.translations[0]?.description || '',
                    price: item.product.price
                } : null
            }));
        }
        
        return c.json(updatedCart);
    } catch (error: any) {
        return c.json({ error: 'Failed to add item to cart', details: error.message }, 500);
    }
});

// 更新购物车商品数量
cartRoutes.put('/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const body = await c.req.json();
    const validation = UpdateCartSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    }
    
    const { quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || (cartItem.cart as any).userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item updated successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to update cart item', details: error.message }, 500);
    }
});

// 删除购物车商品
cartRoutes.delete('/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || (cartItem.cart as any).userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item removed successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to remove cart item', details: error.message }, 500);
    }
});