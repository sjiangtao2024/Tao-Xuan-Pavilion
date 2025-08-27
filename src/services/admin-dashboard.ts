/**
 * 管理员仪表板服务
 * 重定向到独立的HTML文件
 */

import { Hono } from 'hono';
import { AppContext } from '../types';

export function generateAdminDashboard(): string {
    // 返回重定向到静态HTML文件的脚本
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <script>
                window.location.href = '/admin.html';
            </script>
        </head>
        <body>
            <p>正在跳转到管理界面...</p>
        </body>
        </html>
    `;
}