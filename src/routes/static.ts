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

// 媒体文件服务路由
staticRoutes.get('/:key', async (c) => {
    const key = c.req.param('key');
    
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    if (object === null) {
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        return c.json({ error: 'Media not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
        headers,
    });
});