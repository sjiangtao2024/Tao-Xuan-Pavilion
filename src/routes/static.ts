import { Hono } from 'hono';
import type { AppContext } from '../types';

export const staticRoutes = new Hono<AppContext>();

// API 文档路由
staticRoutes.get('/docs', (c) => {
    const swaggerUI = `
<!DOCTYPE html>
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

// 占位符图片API
staticRoutes.get('/placeholder/:width/:height', async (c) => {
    const width = c.req.param('width') || '300';
    const height = c.req.param('height') || '250';
    
    // 返回本地SVG占位图片
    try {
        const svg = await c.env.ASSETS.get('placeholder.svg');
        if (svg) {
            return new Response(await svg.text(), {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    } catch (error) {
        console.error('Error loading placeholder SVG:', error);
    }
    
    // 如果本地文件不存在，生成一个简单的SVG
    const placeholderSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1C1C1C"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#A88F5A" text-anchor="middle" dominant-baseline="middle">No Image</text>
        </svg>
    `;
    
    return new Response(placeholderSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// 通用占位图片路由
staticRoutes.get('/placeholder.svg', async (c) => {
    try {
        const svg = await c.env.ASSETS.get('placeholder.svg');
        if (svg) {
            return new Response(await svg.text(), {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    } catch (error) {
        console.error('Error loading placeholder SVG:', error);
    }
    
    // 如果文件不存在，生成默认SVG
    const defaultSvg = `
        <svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1C1C1C"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#A88F5A" text-anchor="middle" dominant-baseline="middle">No Image</text>
        </svg>
    `;
    
    return new Response(defaultSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// 用户界面静态资源服务
staticRoutes.get('/user/*', async (c) => {
    const path = c.req.path.replace('/user/', 'user/');
    
    try {
        const file = await c.env.ASSETS.get(path);
        if (!file) {
            console.log('Static file not found:', path);
            return c.json({ error: 'File not found' }, 404);
        }
        
        // 根据文件扩展名设置正确的Content-Type
        const headers = new Headers();
        if (path.endsWith('.html')) {
            headers.set('Content-Type', 'text/html; charset=utf-8');
        } else if (path.endsWith('.css')) {
            headers.set('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            headers.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.json')) {
            headers.set('Content-Type', 'application/json');
        }
        
        headers.set('Access-Control-Allow-Origin', '*');
        
        return new Response(await file.text(), { headers });
    } catch (error) {
        console.error('Error serving static file:', error);
        return c.json({ error: 'Error loading file' }, 500);
    }
});

// 管理界面静态资源服务
staticRoutes.get('/admin/*', async (c) => {
    const path = c.req.path.replace('/admin/', 'admin/');
    
    try {
        const file = await c.env.ASSETS.get(path);
        if (!file) {
            console.log('Admin file not found:', path);
            return c.json({ error: 'File not found' }, 404);
        }
        
        const headers = new Headers();
        if (path.endsWith('.html')) {
            headers.set('Content-Type', 'text/html; charset=utf-8');
        } else if (path.endsWith('.css')) {
            headers.set('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            headers.set('Content-Type', 'application/javascript');
        }
        
        headers.set('Access-Control-Allow-Origin', '*');
        
        return new Response(await file.text(), { headers });
    } catch (error) {
        console.error('Error serving admin file:', error);
        return c.json({ error: 'Error loading file' }, 500);
    }
});

// 媒体文件服务路由 - 更具体的路径匹配
staticRoutes.get('/media/:key', async (c) => {
    const key = c.req.param('key');
    
    console.log('请求媒体文件:', key);
    
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    if (object === null) {
        console.log('在图片桶中未找到，尝试视频桶:', key);
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        console.log('媒体文件未找到:', key);
        return c.json({ error: 'Media not found' }, 404);
    }

    console.log('媒体文件找到:', key, '类型:', object.httpMetadata?.contentType);
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // 添加CORS头
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(object.body, {
        headers,
    });
});

// 通用媒体文件服务路由（兼容性）- 处理其他格式的媒体请求
staticRoutes.get('/:key', async (c) => {
    const key = c.req.param('key');
    
    // 只处理媒体文件（图片和视频格式）
    if (!/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i.test(key)) {
        return c.json({ error: 'Not a media file' }, 404);
    }
    
    console.log('通用路由请求媒体文件:', key);
    
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    if (object === null) {
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        console.log('通用路由：媒体文件未找到:', key);
        return c.json({ error: 'Media not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
        headers,
    });
});