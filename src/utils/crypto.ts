/**
 * 加密相关工具函数
 */

// 通用哈希函数
export async function hash(data: ArrayBuffer, algorithm = 'SHA-256'): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return bufferToHex(hashBuffer);
}

// 密码哈希函数
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    return await hash(data);
}

// ArrayBuffer 转十六进制字符串
export function bufferToHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}