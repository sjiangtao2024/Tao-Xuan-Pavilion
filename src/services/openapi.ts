/**
 * 模块化的 OpenAPI 规范生成服务
 * 整合所有API模块
 */

import { openApiConfig, tags, securitySchemes, commonSchemas } from './openapi/base';
import { authSchemas, authPaths } from './openapi/auth';
import { productSchemas, productPaths } from './openapi/products';
import { cartSchemas, cartPaths } from './openapi/cart';
import { adminSchemas, adminPaths } from './openapi/admin';
import { orderSchemas, orderPaths } from './openapi/orders';
import { categorySchemas, categoryPaths } from './openapi/categories';
import { userSchemas, userPaths } from './openapi/users';

export function generateOpenApiSpec() {
    // 合并所有schemas
    const allSchemas = {
        ...commonSchemas,
        ...authSchemas,
        ...productSchemas,
        ...cartSchemas,
        ...adminSchemas,
        ...orderSchemas,
        ...categorySchemas,
        ...userSchemas
    };

    // 合并所有paths
    const allPaths = {
        ...authPaths,
        ...productPaths,
        ...cartPaths,
        ...adminPaths,
        ...orderPaths,
        ...categoryPaths,
        ...userPaths
    };

    return {
        ...openApiConfig,
        tags,
        components: {
            securitySchemes,
            schemas: allSchemas
        },
        paths: allPaths
    };
}
