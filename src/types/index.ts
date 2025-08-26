// 环境类型定义
export interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    IMAGES_BUCKET: R2Bucket;
    VIDEOS_BUCKET: R2Bucket;
    IS_PROD?: string;
}

// JWT 载荷类型
export interface JWTPayload {
    sub: string;
    email: string;
    exp: number;
}

// 媒体项类型
export interface MediaItem {
    type: string;
    url: string;
    name: string;
    file?: File;
}

// 管理员用户类型（用于中间件）
export interface AdminUser {
    id: number;
    email: string;
    role: string;
    status: string;
}

// Context 类型扩展
export interface AppContext {
    Bindings: Env;
    Variables: {
        userId: number;
        adminUser: AdminUser;
    };
}