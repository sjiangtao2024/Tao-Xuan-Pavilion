/**
 * 文件处理相关工具函数
 */

// 生成唯一文件名
export function generateUniqueFilename(filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}-${filename}`;
}