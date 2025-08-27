/**
 * 用户相关API文档（用户自己的操作）
 */

export const userSchemas = {
    "UserProfile": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "email": { "type": "string" },
            "firstName": { "type": "string" },
            "lastName": { "type": "string" },
            "phone": { "type": "string" },
            "avatar": { "type": "string" },
            "createdAt": { "type": "string", "format": "date-time" },
            "lastLoginAt": { "type": "string", "format": "date-time" }
        }
    },
    "UserAddress": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "name": { "type": "string" },
            "phone": { "type": "string" },
            "address": { "type": "string" },
            "city": { "type": "string" },
            "province": { "type": "string" },
            "postalCode": { "type": "string" },
            "isDefault": { "type": "boolean" },
            "createdAt": { "type": "string", "format": "date-time" }
        }
    }
};

export const userPaths = {
    "/users/profile": {
        "get": {
            "summary": "获取用户资料",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "responses": {
                "200": {
                    "description": "用户资料",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/UserProfile" }
                        }
                    }
                },
                "401": { "description": "未授权" }
            }
        },
        "put": {
            "summary": "更新用户资料",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "firstName": { "type": "string" },
                                "lastName": { "type": "string" },
                                "phone": { "type": "string" },
                                "avatar": { "type": "string" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "资料更新成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/UserProfile" }
                        }
                    }
                },
                "400": { "description": "无效的输入数据" },
                "401": { "description": "未授权" }
            }
        }
    },
    "/users/addresses": {
        "get": {
            "summary": "获取用户地址列表",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "responses": {
                "200": {
                    "description": "地址列表",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "array",
                                "items": { "$ref": "#/components/schemas/UserAddress" }
                            }
                        }
                    }
                },
                "401": { "description": "未授权" }
            }
        },
        "post": {
            "summary": "添加新地址",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["name", "phone", "address", "city"],
                            "properties": {
                                "name": { "type": "string" },
                                "phone": { "type": "string" },
                                "address": { "type": "string" },
                                "city": { "type": "string" },
                                "province": { "type": "string" },
                                "postalCode": { "type": "string" },
                                "isDefault": { "type": "boolean", "default": false }
                            }
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "地址添加成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/UserAddress" }
                        }
                    }
                },
                "400": { "description": "无效的地址数据" },
                "401": { "description": "未授权" }
            }
        }
    },
    "/users/addresses/{id}": {
        "get": {
            "summary": "获取地址详情",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "地址ID",
                    "schema": { "type": "integer" }
                }
            ],
            "responses": {
                "200": {
                    "description": "地址详情",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/UserAddress" }
                        }
                    }
                },
                "401": { "description": "未授权" },
                "404": { "description": "地址未找到" }
            }
        },
        "put": {
            "summary": "更新地址",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "地址ID",
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
                                "phone": { "type": "string" },
                                "address": { "type": "string" },
                                "city": { "type": "string" },
                                "province": { "type": "string" },
                                "postalCode": { "type": "string" },
                                "isDefault": { "type": "boolean" }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "地址更新成功",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/UserAddress" }
                        }
                    }
                },
                "400": { "description": "无效的地址数据" },
                "401": { "description": "未授权" },
                "404": { "description": "地址未找到" }
            }
        },
        "delete": {
            "summary": "删除地址",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "地址ID",
                    "schema": { "type": "integer" }
                }
            ],
            "responses": {
                "200": { "description": "地址删除成功" },
                "401": { "description": "未授权" },
                "404": { "description": "地址未找到" }
            }
        }
    },
    "/users/change-password": {
        "put": {
            "summary": "修改密码",
            "tags": ["Users"],
            "security": [{ "BearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "required": ["currentPassword", "newPassword"],
                            "properties": {
                                "currentPassword": { "type": "string" },
                                "newPassword": { "type": "string", "minLength": 8 }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": { "description": "密码修改成功" },
                "400": { "description": "无效的密码或当前密码错误" },
                "401": { "description": "未授权" }
            }
        }
    }
};