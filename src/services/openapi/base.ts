/**
 * OpenAPI 基础配置和通用组件
 */

export const openApiConfig = {
    "openapi": "3.0.3",
    "info": {
        "title": "Tao电商平台 API",
        "description": "基于Cloudflare Workers的电商平台API文档",
        "version": "1.0.0",
        "contact": {
            "name": "Tao电商平台",
            "email": "admin@tao.com"
        }
    },
    "servers": [
        {
            "url": "/api",
            "description": "API Server"
        }
    ]
};

export const tags = [
    {
        "name": "Auth",
        "description": "认证相关API"
    },
    {
        "name": "Admin",
        "description": "管理员功能API"
    },
    {
        "name": "Products",
        "description": "产品管理API"
    },
    {
        "name": "Categories",
        "description": "分类管理API"
    },
    {
        "name": "Users",
        "description": "用户管理API"
    },
    {
        "name": "Cart",
        "description": "购物车API"
    },
    {
        "name": "Orders",
        "description": "订单管理API"
    },
    {
        "name": "Media",
        "description": "媒体文件管理API"
    }
];

export const securitySchemes = {
    "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
    }
};

export const commonSchemas = {
    "ErrorResponse": {
        "type": "object",
        "properties": {
            "error": { "type": "string" },
            "details": { "type": "string" },
            "issues": { "type": "array", "items": { "type": "object" } }
        }
    },
    "PaginationResponse": {
        "type": "object",
        "properties": {
            "page": { "type": "integer" },
            "limit": { "type": "integer" },
            "total": { "type": "integer" },
            "totalPages": { "type": "integer" }
        }
    },
    "SuccessResponse": {
        "type": "object",
        "properties": {
            "success": { "type": "boolean" },
            "message": { "type": "string" }
        }
    }
};