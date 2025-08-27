/**
 * 产品相关API文档
 */

export const productSchemas = {
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
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" },
            "media": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "integer" },
                        "url": { "type": "string" },
                        "mediaType": { "type": "string", "enum": ["image", "video"] },
                        "displayOrder": { "type": "integer" }
                    }
                }
            }
        }
    },
    "Category": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "name": { "type": "string" },
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" }
        }
    }
};

export const productPaths = {
    "/products": {
        "get": {
            "summary": "获取所有产品",
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
            "tags": ["Products"],
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
    }
};