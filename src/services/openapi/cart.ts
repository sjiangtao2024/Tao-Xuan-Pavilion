/**
 * 购物车相关API文档
 */

export const cartSchemas = {
    "Cart": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "userId": { "type": "integer" },
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
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
    }
};

export const cartPaths = {
    "/cart": {
        "get": {
            "summary": "获取用户购物车",
            "tags": ["Cart"],
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
            "tags": ["Cart"],
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
            "tags": ["Cart"],
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
            "tags": ["Cart"],
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
    }
};