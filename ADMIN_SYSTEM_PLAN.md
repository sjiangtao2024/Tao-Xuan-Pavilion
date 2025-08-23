# 管理员系统开发执行计划

## 📋 项目背景
基于 Cloudflare Workers + Hono 框架的电商系统，需要添加完整的管理员后台功能，包括用户管理、订单管理、产品管理等核心功能。

## 🎯 总体目标
构建一个功能完整、安全可靠的管理员后台系统，支持：
- 用户管理（查看、禁用、删除用户）
- 订单管理（状态修改、退款处理）
- 产品管理（CRUD、媒体管理、批量操作）
- 权限控制（角色管理、操作审计）
- 系统统计（仪表板、数据分析）

## 🚀 分阶段执行计划

### Phase 1: 基础权限和用户管理 (优先级: 高)

#### 1.1 数据库迁移
**文件**: `migrations/0013_admin_system_setup.sql`

```sql
-- 扩展 users 表添加管理员字段
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN last_login_at INTEGER;
ALTER TABLE users ADD COLUMN created_by INTEGER;

-- 创建操作审计日志表
CREATE TABLE admin_logs (
    id INTEGER PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 创建第一个超级管理员账户
INSERT OR IGNORE INTO users (email, password, role, status, created_at, updated_at) 
VALUES ('admin@tao.com', 'hashed_admin_password_here', 'super_admin', 'active', strftime('%s', 'now'), strftime('%s', 'now'));
```

**执行命令**:
```powershell
cd c:\dev_code\tao\tao-ecommerce-app ; npx wrangler d1 migrations create admin_system_setup
# 然后编辑生成的迁移文件，添加上述SQL内容
cd c:\dev_code\tao\tao-ecommerce-app ; npx wrangler d1 migrations apply tao-ecommerce-app-db-local --local
```

#### 1.2 权限验证中间件
**文件**: `src/index.ts` (在现有代码中添加)

在 `authMiddleware` 后添加：

```typescript
// 管理员权限验证中间件
const adminMiddleware = async (c: any, next: any) => {
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
    
    c.set('adminUser', user);
    
    // 记录管理员操作日志
    const action = `${c.req.method} ${c.req.path}`;
    await logAdminAction(db, user.id, action, c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'));
    
    await next();
};

// 超级管理员权限验证
const superAdminMiddleware = async (c: any, next: any) => {
    const adminUser = c.get('adminUser');
    if (!adminUser || adminUser.role !== 'super_admin') {
        return c.json({ error: 'Super admin access required' }, 403);
    }
    await next();
};

// 操作日志记录函数
async function logAdminAction(db: any, adminId: number, action: string, ipAddress?: string, userAgent?: string, targetType?: string, targetId?: number, details?: any) {
    await db.insert(adminLogs).values({
        adminId,
        action,
        targetType: targetType || 'system',
        targetId: targetId || null,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        createdAt: new Date()
    });
}
```

#### 1.3 用户管理 API
**文件**: `src/index.ts` (继续添加)

```typescript
// 管理员用户管理 API
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (search) {
            whereConditions.push(like(users.email, `%${search}%`));
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
app.get('/api/admin/users/:id', authMiddleware, adminMiddleware, async (c) => {
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
app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (c) => {
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
        
        if (updatedUser.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'update_user_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { oldStatus: 'unknown', newStatus: status });
        
        return c.json({ success: true, user: updatedUser[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update user status', details: error.message }, 500);
    }
});

// 删除用户 (软删除)
app.delete('/api/admin/users/:id', authMiddleware, superAdminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否存在
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 防止删除管理员账户
        if (['admin', 'super_admin', 'moderator'].includes(user.role)) {
            return c.json({ error: 'Cannot delete admin accounts' }, 403);
        }
        
        // 软删除：将状态设为 deleted
        await db.update(users)
            .set({ status: 'deleted', updatedAt: new Date() })
            .where(eq(users.id, userId));
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'delete_user', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { email: user.email });
        
        return c.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete user', details: error.message }, 500);
    }
});
```

#### 1.4 数据库 Schema 更新
**文件**: `src/db/schema.ts` (添加新表定义)

```typescript
// 添加到现有 schema 文件末尾

export const adminLogs = sqliteTable('admin_logs', {
    id: integer('id').primaryKey(),
    adminId: integer('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: integer('target_id'),
    details: text('details'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// 更新 users 表关系定义
export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
    addresses: many(userAddresses),
    orders: many(orders),
    adminLogs: many(adminLogs), // 新增
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
    admin: one(users, { fields: [adminLogs.adminId], references: [users.id] }),
}));
```

### Phase 2: 订单管理 (优先级: 高)

#### 2.1 订单管理 API
**文件**: `src/index.ts` (继续添加)

```typescript
// 管理员订单管理 API
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (c) => {
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
            whereConditions.push(eq(orders.status, status));
        }
        
        if (userId) {
            whereConditions.push(eq(orders.userId, Number(userId)));
        }
        
        if (startDate) {
            whereConditions.push(gte(orders.createdAt, new Date(startDate)));
        }
        
        if (endDate) {
            whereConditions.push(lte(orders.createdAt, new Date(endDate)));
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
                            columns: { id: true, name: true, price: true }
                        }
                    }
                }
            },
            limit,
            offset,
            orderBy: [desc(orders.createdAt)]
        });
        
        const totalCountResult = await db.select({ count: count() })
            .from(orders)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            orders: orderList,
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
app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, async (c) => {
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
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'update_order_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'order', orderId, { oldStatus: order.status, newStatus: status, reason });
        
        return c.json({ success: true, order: updatedOrder[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update order status', details: error.message }, 500);
    }
});
```

### Phase 3: 产品管理增强 (优先级: 中)

#### 3.1 批量产品操作 API
```typescript
// 批量更新产品
app.put('/api/admin/products/batch', authMiddleware, adminMiddleware, async (c) => {
    const { productIds, updates } = await c.req.json();
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const results = [];
        
        for (const productId of productIds) {
            const updatedProduct = await db.update(products)
                .set({ ...updates, updatedAt: new Date() })
                .where(eq(products.id, productId))
                .returning();
            
            if (updatedProduct.length > 0) {
                results.push(updatedProduct[0]);
            }
        }
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'batch_update_products', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'product', null, { productIds, updates });
        
        return c.json({ success: true, updatedProducts: results });
    } catch (error: any) {
        return c.json({ error: 'Failed to batch update products', details: error.message }, 500);
    }
});
```

### Phase 4: 管理后台前端 (优先级: 中)

#### 4.1 管理员登录页面
**文件**: `src/admin-frontend.html`

创建独立的管理后台前端页面，包含：
- 管理员登录界面
- 仪表板页面
- 用户管理界面
- 订单管理界面
- 产品管理界面

## 📊 API 文档更新

需要在 OpenAPI 文档中添加所有管理员 API 的定义，包括：
- 认证要求
- 权限说明
- 请求/响应格式
- 错误码说明

## 🔒 安全检查清单

- [ ] 所有管理员 API 都有权限验证
- [ ] 敏感操作有操作日志记录
- [ ] 用户密码采用安全哈希算法
- [ ] 管理员账户有强密码要求
- [ ] 实现防暴力破解机制
- [ ] 添加操作确认机制

## 🧪 测试计划

1. **单元测试**
   - 权限验证中间件测试
   - 各 API 端点功能测试
   - 数据库操作测试

2. **集成测试**
   - 完整的管理员操作流程测试
   - 权限边界测试
   - 错误处理测试

3. **安全测试**
   - 权限提升测试
   - SQL 注入测试
   - XSS 防护测试

## 📝 下次会话执行指引

1. **首先检查当前项目状态**
   ```powershell
   cd c:\dev_code\tao\tao-ecommerce-app ; npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```

2. **查看现有用户表结构**
   ```powershell
   cd c:\dev_code\tao\tao-ecommerce-app ; npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="PRAGMA table_info(users);"
   ```

3. **开始执行 Phase 1.1 - 数据库迁移**
   - 创建迁移文件
   - 添加管理员相关字段和表
   - 验证迁移结果

4. **继续按阶段执行后续步骤**

## 📋 当前状态记录

- ✅ 用户资料功能已完成
- ✅ 基础权限验证已存在 (authMiddleware)
- ⏳ 管理员系统待开发
- ⏳ 管理后台前端待创建

## 💡 关键提醒

1. 在开发过程中严格遵循项目的数据库操作规范
2. 所有管理员操作都要记录操作日志
3. 敏感操作需要二次确认机制
4. 定期备份数据库数据
5. 测试所有权限边界情况

---

**文档版本**: v1.0  
**创建时间**: 2025-08-23  
**下次更新**: 根据开发进度更新