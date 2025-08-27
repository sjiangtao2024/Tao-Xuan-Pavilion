/**
 * 订单相关API文档
 */

export const orderSchemas = {
    "OrderItem": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "orderId": { "type": "integer" },
            "productId": { "type": "integer" },
            "quantity": { "type": "integer" },
            "price": { "type": "number" },
            "product": { "$ref": "#/components/schemas/Product" }
        }
    },
    "OrderSummary": {
        "type": "object",
        "properties": {
            "subtotal": { "type": "number" },
            "tax": { "type": "number" },
            "shipping": { "type": "number" },
            "total": { "type": "number" }
        }
    }
};

export const orderPaths = {
    "/orders": {
        "get": {
            "summary": "获取用户订单列表",
            "tags": ["Orders"],
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
                    "schema": { "type": "integer", "default": 10 }
                },
                {
                    "name": "status",
                    "in": "query",
                    "description": "订单状态筛选",
                    "schema": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] }
                }
            ],
            "responses": {
                "200": {
                    "description": "用户订单列表",
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
                "401": { "description": "未授权" }
            }
        },
        "post": {
            "summary": "创建新订单",
            "tags": ["Orders"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["items", "shippingAddress"],
                            "properties": {
                                "items": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "productId": { "type": "integer" },
                                            "quantity": { "type": "integer", "minimum": 1 }
                                        }
                                    }
                                },
                                "shippingAddress": {
                                    "type": "object",
                                    "properties": {
                                        "name": { "type": "string" },
                                        "phone": { "type": "string" },
                                        "address": { "type": "string" },
                                        "city": { "type": "string" },
                                        "postalCode": { "type": "string" }
                                    }
                                },
                                "paymentMethod": { "type": "string", "enum": ["stripe", "alipay", "wechat"] }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "订单创建成功",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "order": { "$ref": "#/components/schemas/Order" },
                                    "paymentUrl": { "type": "string" }
                                }
                            }
                        }
                    }
                },
                "400": { "description": "无效的订单数据" },
                "401": { "description": "未授权" }
            }
        }
    },
    "/orders/{id}": {
        "get": {
            "summary": "获取订单详情",
            "tags": ["Orders"],
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
            "responses": {
                "200": {
                    "description": "订单详情",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/Order" }
                        }
                    }
                },
                "401": { "description": "未授权" },
                "404": { "description": "订单未找到" }
            }
        }
    },
    "/orders/{id}/cancel": {
        "post": {
            "summary": "取消订单",
            "tags": ["Orders"],
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
                "required": false,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "reason": { "type": "string" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "订单取消成功" },
                "400": { "description": "订单无法取消" },
                "401": { "description": "未授权" },
                "404": { "description": "订单未找到" }
            }
        }
    },
    "/orders/{id}/refund": {
        "post": {
            "summary": "申请退款",
            "tags": ["Orders"],
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
                            "required": ["reason"],
                            "properties": {
                                "reason": { "type": "string" },
                                "description": { "type": "string" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "退款申请提交成功" },
                "400": { "description": "订单无法退款" },
                "401": { "description": "未授权" },
                "404": { "description": "订单未找到" }
            }
        }
    }
};