/**
 * OpenAPI 规范生成服务
 */

export function generateOpenApiSpec() {
    return {
        "openapi": "3.0.0",
        "info": {
            "title": "Tao Ecommerce API",
            "version": "1.0.0",
            "description": "API for Tao Ecommerce application"
        },
        "servers": [
            {
                "url": "/api",
                "description": "API Server"
            }
        ],
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            },
            "schemas": {
                "Product": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "name": { "type": "string" },
                        "description": { "type": "string" },
                        "price": { "type": "number" },
                        "categoryId": { "type": "integer" },
                        "categoryName": { "type": "string" },
                        "featured": { "type": "boolean" },
                        "media": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": { "type": "integer" },
                                    "url": { "type": "string" },
                                    "mediaType": { "type": "string", "enum": ["image", "video"] }
                                }
                            }
                        }
                    }
                },
                "Category": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "name": { "type": "string" }
                    }
                },
                "User": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "email": { "type": "string" },
                        "role": { "type": "string", "enum": ["user", "admin", "super_admin", "moderator"] },
                        "status": { "type": "string", "enum": ["active", "disabled", "suspended", "deleted"] }
                    }
                },
                "Cart": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "userId": { "type": "integer" },
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": { "type": "integer" },
                                    "productId": { "type": "integer" },
                                    "quantity": { "type": "integer" },
                                    "product": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        }
                    }
                },
                "Order": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "userId": { "type": "integer" },
                        "status": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] },
                        "total": { "type": "number" },
                        "createdAt": { "type": "string", "format": "date-time" },
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "productId": { "type": "integer" },
                                    "quantity": { "type": "integer" },
                                    "price": { "type": "number" }
                                }
                            }
                        }
                    }
                },
                "AdminLog": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "adminId": { "type": "integer" },
                        "action": { "type": "string" },
                        "targetType": { "type": "string" },
                        "targetId": { "type": "integer" },
                        "details": { "type": "object" },
                        "ipAddress": { "type": "string" },
                        "userAgent": { "type": "string" },
                        "createdAt": { "type": "string", "format": "date-time" }
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
                "ErrorResponse": {
                    "type": "object",
                    "properties": {
                        "error": { "type": "string" },
                        "details": { "type": "string" },
                        "issues": { "type": "array", "items": { "type": "object" } }
                    }
                }
            }
        },
        "paths": {
            "/auth/register": {
                "post": {
                    "summary": "用户注册",
                    "tags": ["认证"],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "password"],
                                    "properties": {
                                        "email": { "type": "string", "format": "email" },
                                        "password": { "type": "string", "minLength": 8 }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "用户创建成功",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "token": { "type": "string" },
                                            "user": { "$ref": "#/components/schemas/User" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            "description": "无效的输入数据或邮箱已存在",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "summary": "用户登录",
                    "tags": ["认证"],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "password"],
                                    "properties": {
                                        "email": { "type": "string", "format": "email" },
                                        "password": { "type": "string" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "登录成功",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "token": { "type": "string" },
                                            "user": { "$ref": "#/components/schemas/User" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": { "description": "无效凭据" },
                        "403": { "description": "账户已禁用" }
                    }
                }
            },
            "/auth/admin-login": {
                "post": {
                    "summary": "管理员登录",
                    "description": "专用于管理员的登录接口，要求用户具有admin、super_admin或moderator角色",
                    "tags": ["认证"],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "password"],
                                    "properties": {
                                        "email": { "type": "string", "format": "email" },
                                        "password": { "type": "string" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "管理员登录成功",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "token": { "type": "string", "description": "包含角色信息的JWT令牌" },
                                            "user": {
                                                "type": "object",
                                                "properties": {
                                                    "id": { "type": "integer" },
                                                    "email": { "type": "string" },
                                                    "role": { "type": "string", "enum": ["admin", "super_admin", "moderator"] }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": { 
                            "description": "无效凭据",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "403": { 
                            "description": "账户已禁用或权限不足",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "error": {
                                                "type": "string",
                                                "enum": ["Account is disabled", "Access denied: Insufficient privileges"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            "description": "服务器内部错误",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/auth/me": {
                "get": {
                    "summary": "获取当前用户信息",
                    "tags": ["认证"],
                    "security": [{ "BearerAuth": [] }],
                    "responses": {
                        "200": {
                            "description": "用户信息",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/User" }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "404": { "description": "用户未找到" }
                    }
                }
            },
            "/products": {
                "get": {
                    "summary": "获取所有产品",
                    "tags": ["产品"],
                    "parameters": [
                        {
                            "name": "lang",
                            "in": "query",
                            "description": "语言代码 (en/zh)",
                            "schema": { "type": "string", "default": "en" }
                        },
                        {
                            "name": "categoryId",
                            "in": "query",
                            "description": "按分类ID筛选",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "产品列表",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            }
                        }
                    }
                },
                "post": {
                    "summary": "创建新产品",
                    "tags": ["产品"],
                    "security": [{ "BearerAuth": [] }],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["name", "description", "price", "categoryId"],
                                    "properties": {
                                        "name": { "type": "string" },
                                        "description": { "type": "string" },
                                        "price": { "type": "number", "minimum": 0 },
                                        "categoryId": { "type": "integer" },
                                        "featured": { "type": "boolean", "default": false },
                                        "lang": { "type": "string", "default": "en" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "产品创建成功",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "400": { "description": "无效的产品数据" },
                        "401": { "description": "未授权" }
                    }
                }
            },
            "/products/categories": {
                "get": {
                    "summary": "获取产品分类",
                    "tags": ["产品"],
                    "parameters": [
                        {
                            "name": "lang",
                            "in": "query",
                            "description": "语言代码 (en/zh)",
                            "schema": { "type": "string", "default": "en" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "分类列表",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/Category" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/products/{id}": {
                "get": {
                    "summary": "获取单个产品",
                    "tags": ["产品"],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "产品ID",
                            "schema": { "type": "integer" }
                        },
                        {
                            "name": "lang",
                            "in": "query",
                            "description": "语言代码 (en/zh)",
                            "schema": { "type": "string", "default": "en" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "产品详情",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "404": { "description": "产品未找到" }
                    }
                },
                "patch": {
                    "summary": "更新产品",
                    "tags": ["产品"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "产品ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "description": { "type": "string" },
                                        "price": { "type": "number", "minimum": 0 },
                                        "categoryId": { "type": "integer" },
                                        "featured": { "type": "boolean" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "产品更新成功",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "400": { "description": "无效的产品数据" },
                        "401": { "description": "未授权" },
                        "404": { "description": "产品未找到" }
                    }
                },
                "delete": {
                    "summary": "删除产品",
                    "tags": ["产品"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "产品ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": { "description": "产品删除成功" },
                        "401": { "description": "未授权" },
                        "404": { "description": "产品未找到" }
                    }
                }
            },
            "/products/{productId}/media": {
                "post": {
                    "summary": "上传产品媒体文件",
                    "tags": ["产品"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "productId",
                            "in": "path",
                            "required": true,
                            "description": "产品ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "multipart/form-data": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "image": {
                                            "type": "array",
                                            "items": { "type": "string", "format": "binary" }
                                        },
                                        "video": {
                                            "type": "array",
                                            "items": { "type": "string", "format": "binary" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "媒体文件上传成功",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "400": { "description": "无效的文件或产品ID" },
                        "401": { "description": "未授权" }
                    }
                }
            },
            "/products/{productId}/media/{mediaLinkId}/set-thumbnail": {
                "post": {
                    "summary": "设置产品缩略图",
                    "tags": ["产品"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "productId",
                            "in": "path",
                            "required": true,
                            "description": "产品ID",
                            "schema": { "type": "integer" }
                        },
                        {
                            "name": "mediaLinkId",
                            "in": "path",
                            "required": true,
                            "description": "媒体链接ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "缩略图设置成功",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "400": { "description": "无效的ID" },
                        "401": { "description": "未授权" }
                    }
                }
            },
            "/cart": {
                "get": {
                    "summary": "获取用户购物车",
                    "tags": ["购物车"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "lang",
                            "in": "query",
                            "description": "语言代码 (en/zh)",
                            "schema": { "type": "string", "default": "en" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "购物车详情",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Cart" }
                                }
                            }
                        },
                        "401": { "description": "未授权" }
                    }
                }
            },
            "/cart/items": {
                "post": {
                    "summary": "添加商品到购物车",
                    "tags": ["购物车"],
                    "security": [{ "BearerAuth": [] }],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["productId", "quantity"],
                                    "properties": {
                                        "productId": { "type": "integer" },
                                        "quantity": { "type": "integer", "minimum": 1 }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "商品添加成功",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Cart" }
                                }
                            }
                        },
                        "400": { "description": "无效的购物车数据" },
                        "401": { "description": "未授权" }
                    }
                }
            },
            "/cart/items/{itemId}": {
                "put": {
                    "summary": "更新购物车商品数量",
                    "tags": ["购物车"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "itemId",
                            "in": "path",
                            "required": true,
                            "description": "购物车项目ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["quantity"],
                                    "properties": {
                                        "quantity": { "type": "integer", "minimum": 1 }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": { "description": "购物车项目更新成功" },
                        "400": { "description": "无效的更新数据" },
                        "401": { "description": "未授权" },
                        "404": { "description": "购物车项目未找到" }
                    }
                },
                "delete": {
                    "summary": "删除购物车商品",
                    "tags": ["购物车"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "itemId",
                            "in": "path",
                            "required": true,
                            "description": "购物车项目ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": { "description": "购物车商品删除成功" },
                        "401": { "description": "未授权" },
                        "404": { "description": "购物车项目未找到" }
                    }
                }
            },
            "/admin/users": {
                "get": {
                    "summary": "获取用户列表",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "description": "页码",
                            "schema": { "type": "integer", "default": 1 }
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "description": "每页数量",
                            "schema": { "type": "integer", "default": 20 }
                        },
                        {
                            "name": "search",
                            "in": "query",
                            "description": "搜索关键词",
                            "schema": { "type": "string" }
                        },
                        {
                            "name": "status",
                            "in": "query",
                            "description": "用户状态筛选",
                            "schema": { "type": "string", "enum": ["active", "disabled", "suspended", "deleted"] }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "用户列表",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "users": {
                                                "type": "array",
                                                "items": { "$ref": "#/components/schemas/User" }
                                            },
                                            "pagination": { "$ref": "#/components/schemas/PaginationResponse" }
                                        }
                                    }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" }
                    }
                }
            },
            "/admin/users/{id}": {
                "get": {
                    "summary": "获取用户详情",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "用户ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "用户详情",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/User" }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" },
                        "404": { "description": "用户未找到" }
                    }
                },
                "delete": {
                    "summary": "删除用户 (软删除)",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "用户ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": { "description": "用户删除成功" },
                        "401": { "description": "未授权" },
                        "403": { "description": "无超级管理员权限" },
                        "404": { "description": "用户未找到" }
                    }
                }
            },
            "/admin/users/{id}/status": {
                "put": {
                    "summary": "修改用户状态",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "用户ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["status"],
                                    "properties": {
                                        "status": { "type": "string", "enum": ["active", "disabled", "suspended"] }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": { "description": "用户状态更新成功" },
                        "400": { "description": "无效的状态" },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" },
                        "404": { "description": "用户未找到" }
                    }
                }
            },
            "/admin/users/{id}/reset-password": {
                "post": {
                    "summary": "重置用户密码",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "用户ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "密码重置成功",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "success": { "type": "boolean" },
                                            "message": { "type": "string" },
                                            "tempPassword": { "type": "string" },
                                            "email": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" },
                        "404": { "description": "用户未找到" }
                    }
                }
            },
            "/admin/orders": {
                "get": {
                    "summary": "获取订单列表",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "description": "页码",
                            "schema": { "type": "integer", "default": 1 }
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "description": "每页数量",
                            "schema": { "type": "integer", "default": 20 }
                        },
                        {
                            "name": "status",
                            "in": "query",
                            "description": "订单状态筛选",
                            "schema": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] }
                        },
                        {
                            "name": "userId",
                            "in": "query",
                            "description": "用户ID筛选",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "订单列表",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "orders": {
                                                "type": "array",
                                                "items": { "$ref": "#/components/schemas/Order" }
                                            },
                                            "pagination": { "$ref": "#/components/schemas/PaginationResponse" }
                                        }
                                    }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" }
                    }
                }
            },
            "/admin/orders/{id}/status": {
                "put": {
                    "summary": "修改订单状态",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": true,
                            "description": "订单ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["status"],
                                    "properties": {
                                        "status": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] },
                                        "reason": { "type": "string" }
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": { "description": "订单状态更新成功" },
                        "400": { "description": "无效的状态" },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" },
                        "404": { "description": "订单未找到" }
                    }
                }
            },
            "/admin/logs": {
                "get": {
                    "summary": "获取管理员操作日志",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "description": "页码",
                            "schema": { "type": "integer", "default": 1 }
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "description": "每页数量",
                            "schema": { "type": "integer", "default": 20 }
                        },
                        {
                            "name": "action",
                            "in": "query",
                            "description": "操作类型筛选",
                            "schema": { "type": "string" }
                        },
                        {
                            "name": "adminId",
                            "in": "query",
                            "description": "管理员ID筛选",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "管理员操作日志",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "logs": {
                                                "type": "array",
                                                "items": { "$ref": "#/components/schemas/AdminLog" }
                                            },
                                            "pagination": { "$ref": "#/components/schemas/PaginationResponse" }
                                        }
                                    }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" }
                    }
                }
            },
            "/admin/logs/cleanup": {
                "delete": {
                    "summary": "手动清理操作日志",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "parameters": [
                        {
                            "name": "days",
                            "in": "query",
                            "description": "保留日志天数",
                            "schema": { "type": "integer", "default": 30 }
                        }
                    ],
                    "responses": {
                        "200": { "description": "日志清理成功" },
                        "401": { "description": "未授权" },
                        "403": { "description": "无超级管理员权限" }
                    }
                }
            },
            "/admin/dashboard": {
                "get": {
                    "summary": "管理员仪表板统计",
                    "tags": ["管理员"],
                    "security": [{ "BearerAuth": [] }],
                    "responses": {
                        "200": {
                            "description": "仪表板统计数据",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "totalUsers": { "type": "integer" },
                                            "totalOrders": { "type": "integer" },
                                            "totalProducts": { "type": "integer" },
                                            "newUsersThisMonth": { "type": "integer" },
                                            "orderStatusStats": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "status": { "type": "string" },
                                                        "count": { "type": "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "401": { "description": "未授权" },
                        "403": { "description": "无管理员权限" }
                    }
                }
            }
        }
    };
}