import { Hono } from 'hono';
import type { AppContext } from '../types';
import { ServerDebug } from '../utils/debug';

export const staticRoutes = new Hono<AppContext>();

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
        ServerDebug.error('static', 'Error loading placeholder SVG:', error);
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

// 处理用户界面文件的通用路由
staticRoutes.get('/user/*', async (c) => {
    const path = c.req.path.replace('/user/', '');
    
    try {
        if (!c.env?.ASSETS) {
            return c.json({ error: 'Static assets not available' }, 503);
        }
        
        const file = await c.env.ASSETS.get(`user/${path}`);
        if (!file) {
            return c.json({ error: 'File not found' }, 404);
        }
        
        const headers = new Headers();
        
        // 设置正确的 Content-Type
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
        ServerDebug.error('static', 'Error serving user file:', error);
        return c.json({ error: 'Error loading file' }, 500);
    }
});

// 处理管理员界面文件的通用路由
staticRoutes.get('/admin/*', async (c) => {
    const path = c.req.path.replace('/admin/', '');
    
    try {
        if (!c.env?.ASSETS) {
            return c.json({ error: 'Static assets not available' }, 503);
        }
        
        const file = await c.env.ASSETS.get(`admin/${path}`);
        if (!file) {
            return c.json({ error: 'File not found' }, 404);
        }
        
        const headers = new Headers();
        
        // 设置正确的 Content-Type
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
        ServerDebug.error('static', 'Error serving admin file:', error);
        return c.json({ error: 'Error loading file' }, 500);
    }
});

// 媒体文件服务路由 - 更具体的路径匹配
staticRoutes.get('/media/:key', async (c) => {
    const key = c.req.param('key');
    
    ServerDebug.log('static', '请求媒体文件:', key);
    
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    if (object === null) {
        ServerDebug.log('static', '在图片桶中未找到，尝试视频桶:', key);
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        ServerDebug.warn('static', '媒体文件未找到:', key);
        return c.json({ error: 'Media not found' }, 404);
    }

    ServerDebug.success('static', '媒体文件找到:', key, '类型:', object.httpMetadata?.contentType);
    
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
    
    ServerDebug.log('static', '通用路由请求媒体文件:', key);
    
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    if (object === null) {
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        ServerDebug.warn('static', '通用路由：媒体文件未找到:', key);
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