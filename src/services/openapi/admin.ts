/**
 * 管理员相关API文档
 */

export const adminSchemas = {
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
    "Order": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "userId": { "type": "integer" },
            "status": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] },
            "total": { "type": "number" },
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
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
    "MediaAsset": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "url": { "type": "string" },
            "mediaType": { "type": "string", "enum": ["image", "video"] },
            "filename": { "type": "string" },
            "fileSize": { "type": "integer" },
            "mimeType": { "type": "string" },
            "createdAt": { "type": "string", "format": "date-time" }
        }
    }
};

export const adminPaths = {
    "/admin/dashboard": {
        "get": {
            "summary": "管理员仪表板统计",
            "tags": ["Admin"],
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
    },
    "/admin/users": {
        "get": {
            "summary": "获取用户列表",
            "tags": ["Admin"],
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
            "tags": ["Admin"],
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
            "summary": "删除用户(软删除)",
            "tags": ["Admin"],
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
                    "description": "用户删除成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/SuccessResponse" }
                        }
                    }
                },
                "401": { "description": "未授权" },
                "403": { "description": "无超级管理员权限" },
                "404": { "description": "用户未找到" }
            }
        }
    },
    "/admin/users/{id}/status": {
        "put": {
            "summary": "修改用户状态",
            "tags": ["Admin"],
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
            "tags": ["Admin"],
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
                                    "tempPassword": { "type": "string" }
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
            "tags": ["Admin"],
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
            "tags": ["Admin"],
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
    "/admin/products": {
        "get": {
            "summary": "获取产品列表(管理员)",
            "tags": ["Admin"],
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
                    "name": "categoryId",
                    "in": "query",
                    "description": "分类ID筛选",
                    "schema": { "type": "integer" }
                }
            ],
            "responses": {
                "200": {
                    "description": "产品列表",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "products": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/Product" }
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
        },
        "post": {
            "summary": "创建产品(管理员)",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["name_zh", "description_zh", "price", "categoryId"],
                            "properties": {
                                "name_zh": { "type": "string" },
                                "name_en": { "type": "string" },
                                "description_zh": { "type": "string" },
                                "description_en": { "type": "string" },
                                "price": { "type": "number", "minimum": 0 },
                                "categoryId": { "type": "integer" },
                                "featured": { "type": "boolean", "default": false }
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
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" }
            }
        }
    },
    "/admin/categories": {
        "get": {
            "summary": "获取分类列表(管理员)",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "lang",
                    "in": "query",
                    "description": "语言代码",
                    "schema": { "type": "string", "enum": ["zh", "en"], "default": "zh" }
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
                },
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" }
            }
        },
        "post": {
            "summary": "创建新分类",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["name_zh"],
                            "properties": {
                                "name_zh": { "type": "string", "description": "中文分类名称" },
                                "name_en": { "type": "string", "description": "英文分类名称" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "分类创建成功",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": { "type": "boolean" },
                                    "categoryId": { "type": "integer" },
                                    "message": { "type": "string" }
                                }
                            }
                        }
                    }
                },
                "400": { "description": "请求参数错误" },
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" }
            }
        }
    },
    "/admin/media/upload": {
        "post": {
            "summary": "上传媒体文件",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "multipart/form-data": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "files": {
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
                    "description": "文件上传成功",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "success": { "type": "boolean" },
                                    "assets": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/MediaAsset" }
                                    }
                                }
                            }
                        }
                    }
                },
                "400": { "description": "无效的文件" },
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" }
            }
        }
    },
    "/admin/logs": {
        "get": {
            "summary": "获取管理员操作日志",
            "tags": ["Admin"],
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
    "/admin/categories/{id}": {
        "put": {
            "summary": "修改分类",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "分类ID",
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
                                "name_zh": { "type": "string", "description": "中文分类名称" },
                                "name_en": { "type": "string", "description": "英文分类名称" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "分类更新成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/SuccessResponse" }
                        }
                    }
                },
                "400": { "description": "请求参数错误" },
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" },
                "404": { "description": "分类未找到" }
            }
        },
        "delete": {
            "summary": "删除分类",
            "tags": ["Admin"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "分类ID",
                    "schema": { "type": "integer" }
                }
            ],
            "responses": {
                "200": {
                    "description": "分类删除成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/SuccessResponse" }
                        }
                    }
                },
                "401": { "description": "未授权" },
                "403": { "description": "无管理员权限" },
                "404": { "description": "分类未找到" }
            }
        }
    },
    "/admin/logs/cleanup": {
        "delete": {
            "summary": "手动清理操作日志",
            "tags": ["Admin"],
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
    }
};