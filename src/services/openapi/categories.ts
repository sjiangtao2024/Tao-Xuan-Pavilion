/**
 * 分类管理相关API文档
 */

export const categorySchemas = {
    "CategoryDetail": {
        "type": "object",
        "properties": {
            "id": { "type": "integer" },
            "name_zh": { "type": "string", "description": "中文名称" },
            "name_en": { "type": "string", "description": "英文名称" },
            "name": { "type": "string", "description": "当前语言的名称" },
            "createdAt": { "type": "string", "format": "date-time" },
            "updatedAt": { "type": "string", "format": "date-time" }
        }
    }
};

export const categoryPaths = {
    "/categories": {
        "get": {
            "summary": "获取所有分类(公开)",
            "tags": ["Categories"],
            "parameters": [
                {
                    "name": "lang",
                    "in": "query",
                    "description": "语言代码 (zh/en)",
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
                }
            }
        }
    },
    "/categories/{id}": {
        "get": {
            "summary": "获取分类详情",
            "tags": ["Categories"],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "分类ID",
                    "schema": { "type": "integer" }
                },
                {
                    "name": "lang",
                    "in": "query",
                    "description": "语言代码 (zh/en)",
                    "schema": { "type": "string", "enum": ["zh", "en"], "default": "zh" }
                }
            ],
            "responses": {
                "200": {
                    "description": "分类详情",
                    "content": {
                        "application/json": {
                            "schema": { "$ref": "#/components/schemas/CategoryDetail" }
                        }
                    }
                },
                "404": { "description": "分类未找到" }
            }
        }
    },
    "/categories/{id}/products": {
        "get": {
            "summary": "获取分类下的产品",
            "tags": ["Categories"],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "description": "分类ID",
                    "schema": { "type": "integer" }
                },
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
                    "name": "lang",
                    "in": "query",
                    "description": "语言代码 (zh/en)",
                    "schema": { "type": "string", "enum": ["zh", "en"], "default": "zh" }
                }
            ],
            "responses": {
                "200": {
                    "description": "分类下的产品列表",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "products": {
                                        "type": "array",
                                        "items": { "$ref": "#/components/schemas/Product" }
                                    },
                                    "pagination": { "$ref": "#/components/schemas/PaginationResponse" },
                                    "category": { "$ref": "#/components/schemas/CategoryDetail" }
                                }
                            }
                        }
                    }
                },
                "404": { "description": "分类未找到" }
            }
        }
    }
};