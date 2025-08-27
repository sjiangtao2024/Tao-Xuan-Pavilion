/**
 * 认证相关API文档
 */

export const authSchemas = {
    "User": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "email": { "type": "string" },
            "role": { "type": "string", "enum": ["user", "admin", "super_admin", "moderator"] },
            "status": { "type": "string", "enum": ["active", "disabled", "suspended", "deleted"] },
            "createdAt": { "type": "string", "format": "date-time" },
            "lastLoginAt": { "type": "string", "format": "date-time" }
        }
    }
};

export const authPaths = {
    "/auth/register": {
        "post": {
            "summary": "用户注册",
            "tags": ["Auth"],
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
            "tags": ["Auth"],
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
            "tags": ["Auth"],
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
            "tags": ["Auth"],
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
    }
};