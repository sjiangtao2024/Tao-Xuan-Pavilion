/**
 * JWT Token 工具 - 支持多种认证方式
 * 兼容邮箱密码认证和 OAuth 认证（Google, GitHub 等）
 */

import { sign, verify } from 'hono/jwt';

// JWT Payload 接口定义
export interface JWTPayload {
    // 标准JWT字段
    sub: string; // 用户ID
    iat?: number; // 签发时间
    exp?: number; // 过期时间
    
    // 用户基本信息
    email: string;
    role?: string;
    emailVerified?: boolean;
    
    // 认证方式相关
    authMethod: 'email' | 'oauth'; // 认证方式
    oauthProvider?: string; // OAuth提供商 ('google', 'github', etc.)
    
    // OAuth特定字段
    googleId?: string; // Google OAuth ID
    picture?: string; // 用户头像URL
    
    // 权限和状态
    status?: string; // 账户状态
    permissions?: string[]; // 权限列表
}

// Token 生成选项
export interface TokenOptions {
    expiresIn?: string | number; // 过期时间 (如 '7d', 3600)
    issuer?: string; // 签发者
    audience?: string; // 受众
}

// 默认token配置
const DEFAULT_TOKEN_OPTIONS: TokenOptions = {
    expiresIn: '7d', // 7天过期
    issuer: 'tao-ecommerce',
    audience: 'tao-ecommerce-users',
};

/**
 * 生成JWT Token
 * @param payload JWT载荷
 * @param secret JWT密钥
 * @param options Token选项
 * @returns JWT Token字符串
 */
export async function generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>, 
    secret: string,
    options: TokenOptions = {}
): Promise<string> {
    const mergedOptions = { ...DEFAULT_TOKEN_OPTIONS, ...options };
    const now = Math.floor(Date.now() / 1000);
    
    // 计算过期时间
    let exp: number;
    if (typeof mergedOptions.expiresIn === 'string') {
        // 解析字符串格式的过期时间 (如 '7d', '24h', '60m')
        exp = now + parseExpirationString(mergedOptions.expiresIn);
    } else if (typeof mergedOptions.expiresIn === 'number') {
        exp = now + mergedOptions.expiresIn;
    } else {
        exp = now + (7 * 24 * 60 * 60); // 默认7天
    }
    
    const fullPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: exp,
    };
    
    return await sign(fullPayload, secret);
}

/**
 * 验证并解析JWT Token
 * @param token JWT Token字符串
 * @param secret JWT密钥
 * @returns 解析后的payload
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload> {
    try {
        const payload = await verify(token, secret) as JWTPayload;
        
        // 检查token是否过期
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
            throw new Error('Token expired');
        }
        
        return payload;
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
}

/**
 * 为邮箱密码认证生成Token
 * @param user 用户信息
 * @param secret JWT密钥
 * @param options Token选项
 * @returns JWT Token
 */
export async function generateEmailAuthToken(
    user: {
        id: number;
        email: string;
        role?: string;
        status?: string;
        emailVerified?: boolean;
    },
    secret: string,
    options: TokenOptions = {}
): Promise<string> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
        status: user.status,
        authMethod: 'email',
        emailVerified: user.emailVerified ?? false,
    };
    
    return await generateToken(payload, secret, options);
}

/**
 * 为OAuth认证生成Token
 * @param user 用户信息
 * @param oauthData OAuth相关数据
 * @param secret JWT密钥
 * @param options Token选项
 * @returns JWT Token
 */
export async function generateOAuthToken(
    user: {
        id: number;
        email: string;
        role?: string;
        status?: string;
    },
    oauthData: {
        provider: string;
        googleId?: string;
        picture?: string;
    },
    secret: string,
    options: TokenOptions = {}
): Promise<string> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
        status: user.status,
        authMethod: 'oauth',
        oauthProvider: oauthData.provider,
        emailVerified: true, // OAuth用户邮箱默认已验证
        picture: oauthData.picture,
    };
    
    // 添加特定OAuth提供商的字段
    if (oauthData.provider === 'google' && oauthData.googleId) {
        payload.googleId = oauthData.googleId;
    }
    
    return await generateToken(payload, secret, options);
}

/**
 * 刷新Token（生成新的token，延长有效期）
 * @param oldToken 旧token
 * @param secret JWT密钥
 * @param options Token选项
 * @returns 新的JWT Token
 */
export async function refreshToken(
    oldToken: string,
    secret: string,
    options: TokenOptions = {}
): Promise<string> {
    try {
        // 验证旧token（即使过期也要能读取payload）
        const payload = await verify(oldToken, secret, false) as JWTPayload;
        
        // 移除时间相关字段，生成新token
        const { iat, exp, ...userPayload } = payload;
        return await generateToken(userPayload, secret, options);
    } catch (error) {
        throw new Error(`Token refresh failed: ${error.message}`);
    }
}

/**
 * 解析过期时间字符串
 * @param expiresIn 过期时间字符串 (如 '7d', '24h', '60m', '30s')
 * @returns 秒数
 */
function parseExpirationString(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
        throw new Error('Invalid expiration format. Use format like "7d", "24h", "60m", "30s"');
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'd': return value * 24 * 60 * 60; // 天
        case 'h': return value * 60 * 60; // 小时
        case 'm': return value * 60; // 分钟
        case 's': return value; // 秒
        default: throw new Error('Invalid time unit');
    }
}

/**
 * 提取Token中的用户ID
 * @param token JWT Token
 * @param secret JWT密钥
 * @returns 用户ID
 */
export async function extractUserId(token: string, secret: string): Promise<number> {
    const payload = await verifyToken(token, secret);
    return parseInt(payload.sub);
}

/**
 * 检查Token是否即将过期（在指定时间内）
 * @param token JWT Token
 * @param secret JWT密钥
 * @param thresholdSeconds 阈值秒数，默认24小时
 * @returns 是否即将过期
 */
export async function isTokenExpiringSoon(
    token: string, 
    secret: string, 
    thresholdSeconds: number = 24 * 60 * 60
): Promise<boolean> {
    try {
        const payload = await verifyToken(token, secret);
        if (!payload.exp) return false;
        
        const now = Math.floor(Date.now() / 1000);
        return (payload.exp - now) < thresholdSeconds;
    } catch {
        return true; // 如果验证失败，认为需要刷新
    }
}