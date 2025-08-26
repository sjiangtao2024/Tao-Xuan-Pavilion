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
                        "email": { "type": "string" }
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
                }
            }
        },
        "paths": {
            "/auth/register": {
                "post": {
                    "summary": "User registration",
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
                            "description": "User created successfully",
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
                        "400": { "description": "Invalid input data or email already exists" }
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "summary": "User login",
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
                            "description": "Login successful",
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
                        "400": { "description": "Invalid credentials" },
                        "403": { "description": "Account disabled" }
                    }
                }
            },
            "/products": {
                "get": {
                    "summary": "Get all products",
                    "parameters": [
                        {
                            "name": "lang",
                            "in": "query",
                            "description": "Language code (en/zh)",
                            "schema": { "type": "string", "default": "en" }
                        },
                        {
                            "name": "categoryId",
                            "in": "query",
                            "description": "Filter by category ID",
                            "schema": { "type": "integer" }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "List of products",
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
                    "summary": "Create a new product",
                    "security": [{ "BearerAuth": [] }],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["name", "description", "price"],
                                    "properties": {
                                        "name": { "type": "string" },
                                        "description": { "type": "string" },
                                        "price": { "type": "number" },
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
                            "description": "Product created",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/Product" }
                                }
                            }
                        },
                        "400": { "description": "Invalid input data" },
                        "401": { "description": "Unauthorized" }
                    }
                }
            }
        }
    };
}