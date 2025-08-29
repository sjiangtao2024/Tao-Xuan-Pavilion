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
        if (c.env?.ASSETS) {
            const svg = await c.env.ASSETS.get('placeholder.svg');
            if (svg) {
                return new Response(await svg.text(), {
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
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
        if (c.env?.ASSETS) {
            const svg = await c.env.ASSETS.get('placeholder.svg');
            if (svg) {
                return new Response(await svg.text(), {
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
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
        // 检查 ASSETS 绑定是否可用
        if (!c.env?.ASSETS) {
            console.log('ASSETS binding not available for:', path);
            
            // 对于 index.html，提供开发环境说明
            if (path === 'user/index.html') {
                const developmentHtml = '<!DOCTYPE html>' +
                    '<html lang="zh-CN">' +
                    '<head>' +
                    '<meta charset="UTF-8">' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
                    '<title>道玄阁 - 开发环境配置</title>' +
                    '<style>' +
                    'body { font-family: Arial, sans-serif; background: #1a1a1a; color: #f0f0f0; margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }' +
                    '.container { max-width: 600px; background: rgba(40, 40, 40, 0.9); border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #444; }' +
                    'h1 { color: #ffd700; text-align: center; margin-bottom: 10px; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }' +
                    '.subtitle { text-align: center; color: #ccc; margin-bottom: 30px; font-size: 1.2em; }' +
                    '.status-box { background: #2a1810; border: 2px solid #d4641a; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }' +
                    '.status-icon { font-size: 3em; margin-bottom: 10px; }' +
                    '.solutions { background: #1a2a1a; border: 2px solid #4a7c59; border-radius: 10px; padding: 25px; margin: 20px 0; }' +
                    '.solution-item { margin: 15px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid #4a7c59; }' +
                    '.cmd { background: #000; color: #0f0; padding: 8px 12px; border-radius: 5px; font-family: Consolas, Monaco, monospace; margin: 5px 0; display: inline-block; border: 1px solid #333; }' +
                    '.btn { background: linear-gradient(45deg, #d4641a, #ff7b2a); color: white; padding: 12px 25px; border: none; border-radius: 8px; margin: 10px; cursor: pointer; text-decoration: none; display: inline-block; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(212, 100, 26, 0.3); }' +
                    '.btn:hover { background: linear-gradient(45deg, #ff7b2a, #d4641a); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 100, 26, 0.4); }' +
                    '.btn-secondary { background: linear-gradient(45deg, #666, #888); box-shadow: 0 4px 15px rgba(102, 102, 102, 0.3); }' +
                    '.btn-secondary:hover { background: linear-gradient(45deg, #888, #666); }' +
                    '.footer { text-align: center; margin-top: 30px; color: #888; font-size: 0.9em; }' +
                    'ol { padding-left: 20px; }' +
                    'li { margin: 8px 0; line-height: 1.6; }' +
                    '</style>' +
                    '</head>' +
                    '<body>' +
                    '<div class="container">' +
                    '<h1>道玄阁</h1>' +
                    '<div class="subtitle">Tao Xuan Pavilion</div>' +
                    '<div class="status-box">' +
                    '<div class="status-icon">⚡</div>' +
                    '<h3>开发环境 - ASSETS 绑定配置中</h3>' +
                    '<p>本地开发服务器正在运行，但需要正确配置静态资源绑定。</p>' +
                    '</div>' +
                    '<div class="solutions">' +
                    '<h3>🛠️ 配置步骤：</h3>' +
                    '<div class="solution-item">' +
                    '<strong>方法一：添加 assets 配置</strong><br>' +
                    '在 <code>wrangler.jsonc</code> 中添加：<br>' +
                    '<div class="cmd">\"assets\": { \"directory\": \"./public\", \"binding\": \"ASSETS\" }</div>' +
                    '</div>' +
                    '<div class="solution-item">' +
                    '<strong>方法二：使用 --assets 参数</strong><br>' +
                    '<div class="cmd">wrangler dev --assets ./public</div>' +
                    '</div>' +
                    '<div class="solution-item">' +
                    '<strong>方法三：重启开发服务器</strong><br>' +
                    '<div class="cmd">npm run dev</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="text-align: center;">' +
                    '<button class="btn" onclick="location.reload()">🔄 重新加载</button>' +
                    '<a href="/legacy" class="btn btn-secondary">📄 旧版界面</a>' +
                    '</div>' +
                    '<div class="footer">' +
                    '<p>💡 提示：配置完成后刷新页面即可进入完整的模块化系统</p>' +
                    '<p>开发环境状态检测 - ' + new Date().toLocaleString() + '</p>' +
                    '</div>' +
                    '</div>' +
                    '<script>' +
                    'console.log("📊 开发环境状态:");' +
                    'console.log("- ASSETS 绑定: 未配置");' +
                    'console.log("- 静态文件服务: 开发模式");' +
                    'console.log("- 建议: 配置 assets 绑定或使用 --assets 参数");' +
                    '</script>' +
                    '</body>' +
                    '</html>';
                return c.html(developmentHtml);
            }
            
            // 对于其他静态文件，返回明确的错误信息
            return c.json({ 
                error: 'ASSETS binding not available in development mode',
                suggestion: 'Configure assets binding in wrangler.jsonc or use --assets flag',
                path: path
            }, 503);
        }
        
        // ASSETS 可用时的正常处理
        const file = await c.env.ASSETS.get(path);
        if (!file) {
            console.log('File not found in ASSETS:', path);
            return c.json({ error: 'File not found', path: path }, 404);
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
        return c.json({ error: 'Error loading file', details: (error as Error).message }, 500);
    }
});



// 管理界面静态资源服务
staticRoutes.get('/admin/*', async (c) => {
    const path = c.req.path.replace('/admin/', 'admin/');
    
    try {
        if (!c.env?.ASSETS) {
            console.log('ASSETS binding not available for admin route');
            return c.json({ error: 'ASSETS binding required' }, 503);
        }
        
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