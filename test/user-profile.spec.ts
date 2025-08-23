import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index';
import { drizzle } from 'drizzle-orm/d1';
import { users, userProfiles, userAddresses, orders } from '../src/db/schema';
import { eq } from 'drizzle-orm';
// Using mock authentication for testing

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('用户资料功能测试', () => {
    let testUserId: number;
    let authToken: string;
    let db: ReturnType<typeof drizzle>;

    beforeEach(async () => {
        // 初始化数据库连接
        db = drizzle(env.DB);
        
        // 创建测试用户
        const testUser = await db.insert(users).values({
            email: 'testuser@example.com',
            password: 'hashedpassword123'
        }).returning();
        
        testUserId = testUser[0].id;
        
        // 生成模拟JWT令牌用于测试
        authToken = 'mock-jwt-token-for-testing';
    });

    describe('用户资料管理 API', () => {
        it('应该能获取用户资料 - GET /api/profile', async () => {
            const request = new IncomingRequest('http://example.com/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        it('应该能更新用户资料 - PUT /api/profile', async () => {
            const profileData = {
                firstName: '张',
                lastName: '三',
                phone: '13800138000',
                gender: 'male',
                dateOfBirth: '1990-01-01'
            };

            const request = new IncomingRequest('http://example.com/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.profile.firstName).toBe('张');
            expect(data.profile.lastName).toBe('三');
        });

        it('未认证用户不能访问资料 - GET /api/profile', async () => {
            const request = new IncomingRequest('http://example.com/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(401);
        });
    });

    describe('地址管理 API', () => {
        it('应该能创建新地址 - POST /api/addresses', async () => {
            const addressData = {
                title: '家',
                recipientName: '张三',
                recipientPhone: '13800138000',
                country: '中国',
                province: '北京市',
                city: '北京市',
                district: '朝阳区',
                streetAddress: '某街道123号',
                postalCode: '100000',
                isDefault: true
            };

            const request = new IncomingRequest('http://example.com/api/addresses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.address.title).toBe('家');
            expect(data.address.isDefault).toBe(true);
        });

        it('应该能获取用户所有地址 - GET /api/addresses', async () => {
            // 先创建一个测试地址
            await db.insert(userAddresses).values({
                userId: testUserId,
                title: '测试地址',
                recipientName: '测试用户',
                recipientPhone: '13800138000',
                country: '中国',
                province: '北京市',
                city: '北京市',
                streetAddress: '测试街道',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const request = new IncomingRequest('http://example.com/api/addresses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.addresses)).toBe(true);
        });

        it('应该能删除地址 - DELETE /api/addresses/:id', async () => {
            // 先创建一个测试地址
            const [testAddress] = await db.insert(userAddresses).values({
                userId: testUserId,
                title: '待删除地址',
                recipientName: '测试用户',
                recipientPhone: '13800138000',
                country: '中国',
                province: '北京市',
                city: '北京市',
                streetAddress: '测试街道',
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();

            const request = new IncomingRequest(`http://example.com/api/addresses/${testAddress.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    describe('订单查询 API', () => {
        it('应该能获取用户订单 - GET /api/orders', async () => {
            // 创建一个测试订单
            await db.insert(orders).values({
                userId: testUserId,
                totalAmount: 99.99,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const request = new IncomingRequest('http://example.com/api/orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.orders)).toBe(true);
        });

        it('应该能筛选进行中的订单 - GET /api/orders?status=active', async () => {
            // 创建不同状态的订单
            await db.insert(orders).values([
                {
                    userId: testUserId,
                    totalAmount: 99.99,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    userId: testUserId,
                    totalAmount: 199.99,
                    status: 'delivered',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]);

            const request = new IncomingRequest('http://example.com/api/orders?status=active', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            // 应该只返回进行中的订单
            expect(data.orders.every((order: any) => 
                ['pending', 'paid', 'shipped'].includes(order.status)
            )).toBe(true);
        });
    });

    describe('密码修改 API', () => {
        it('应该能修改密码 - PUT /api/change-password', async () => {
            const passwordData = {
                currentPassword: 'hashedpassword123',
                newPassword: 'newpassword456'
            };

            const request = new IncomingRequest('http://example.com/api/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        it('当前密码错误时应该返回错误', async () => {
            const passwordData = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword456'
            };

            const request = new IncomingRequest('http://example.com/api/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            });
            
            const ctx = createExecutionContext();
            const response = await worker.fetch(request, env, ctx);
            await waitOnExecutionContext(ctx);
            
            expect(response.status).toBe(400);
        });
    });

    describe('数据库表结构验证', () => {
        it('user_profiles 表应该存在并有正确的字段', async () => {
            // 尝试插入一条用户资料记录
            const profileData = {
                userId: testUserId,
                firstName: '测试',
                lastName: '用户',
                phone: '13800138000',
                gender: 'male' as const,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.insert(userProfiles).values(profileData).returning();
            expect(result).toHaveLength(1);
            expect(result[0].firstName).toBe('测试');
            expect(result[0].userId).toBe(testUserId);
        });

        it('user_addresses 表应该存在并有正确的字段', async () => {
            // 尝试插入一条地址记录
            const addressData = {
                userId: testUserId,
                title: '测试地址',
                recipientName: '收件人',
                recipientPhone: '13800138000',
                country: '中国',
                province: '北京市',
                city: '北京市',
                streetAddress: '测试街道123号',
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.insert(userAddresses).values(addressData).returning();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('测试地址');
            expect(result[0].isDefault).toBe(true);
        });

        it('orders 表应该包含新增的收货地址字段', async () => {
            // 尝试插入包含收货地址信息的订单
            const orderData = {
                userId: testUserId,
                totalAmount: 299.99,
                status: 'pending' as const,
                shippingRecipientName: '收件人姓名',
                shippingRecipientPhone: '13800138000',
                shippingCountry: '中国',
                shippingProvince: '上海市',
                shippingCity: '上海市',
                shippingStreetAddress: '收货街道456号',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.insert(orders).values(orderData).returning();
            expect(result).toHaveLength(1);
            expect(result[0].shippingRecipientName).toBe('收件人姓名');
            expect(result[0].shippingCountry).toBe('中国');
        });
    });
});