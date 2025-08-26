import { Hono } from 'hono';
import type { AppContext } from './types';
import { corsMiddleware } from './middleware';
import { authRoutes, productRoutes, cartRoutes, adminRoutes, staticRoutes } from './routes';
import { generateAdminDashboard, generateOpenApiSpec } from './services';

import html from './frontend.html';

const app = new Hono<AppContext>();

// 应用 CORS 中间件
app.use('/api/*', corsMiddleware);

// 主页路由
app.get('/', (c) => c.html(html));

// 管理员仪表板路由
app.get('/admin', (c) => {
    return c.html(generateAdminDashboard());
});

// API 文档路由
app.route('/api/docs', staticRoutes);

// OpenAPI JSON 文档
app.get('/openapi.json', async (c) => {
    try {
        const openApiSpec = generateOpenApiSpec();
        return c.json(openApiSpec);
    } catch (error) {
        return c.json({ error: 'Failed to load API documentation' }, 500);
    }
});

// 媒体文件服务路由
app.route('/media', staticRoutes);

// API 路由
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/cart', cartRoutes);
app.route('/api/admin', adminRoutes);

export default app;