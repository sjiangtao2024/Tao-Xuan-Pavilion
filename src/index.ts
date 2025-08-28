import { Hono } from 'hono';
import type { AppContext } from './types';
import { corsMiddleware } from './middleware';
import { authRoutes, productRoutes, cartRoutes, adminRoutes, staticRoutes } from './routes';
import { generateAdminDashboard, generateOpenApiSpec } from './services';

import html from './frontend.html';

const app = new Hono<AppContext>();

// 应用 CORS 中间件
app.use('/api/*', corsMiddleware);

// 主页路由 - 重定向到模块化界面
app.get('/', (c) => {
    return c.redirect('/user/', 302);
});

// 模块化用户界面路由
app.get('/user/', async (c) => {
    try {
        const html = await c.env.ASSETS.get('user/index.html');
        if (!html) {
            return c.text('User interface not found', 404);
        }
        return c.html(await html.text());
    } catch (error) {
        console.error('Error serving user interface:', error);
        return c.text('Error loading user interface', 500);
    }
});

// 保持向后兼容 - 原始frontend.html路由
app.get('/legacy', (c) => c.html(html));

// 管理员仪表板路由
app.get('/admin', (c) => {
    return c.html(generateAdminDashboard());
});

// 用户管理路由
app.get('/admin/user-management', async (c) => {
    try {
        const html = await c.env.ASSETS.get('admin/user-management.html');
        if (!html) {
            return c.text('Admin interface not found', 404);
        }
        return c.html(await html.text());
    } catch (error) {
        console.error('Error serving admin interface:', error);
        return c.text('Error loading admin interface', 500);
    }
});

// API 文档路由
app.get('/api/docs', (c) => {
    const swaggerUI = `<!DOCTYPE html>
<html>
<head>
    <title>Tao Ecommerce API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
    return c.html(swaggerUI);
});

// OpenAPI JSON 文档路由
app.get('/openapi.json', (c) => {
    const openApiSpec = generateOpenApiSpec();
    return c.json(openApiSpec);
});

// 健康检查端点
app.get('/api/health', (c) => {
    return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'development'
    });
});

// 静态文件服务路由 - 顺序很重要，先配置具体路径
app.route('/media', staticRoutes);
app.route('/', staticRoutes);

// API 路由
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/cart', cartRoutes);
app.route('/api/admin', adminRoutes);

export default app;