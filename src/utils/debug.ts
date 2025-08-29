/**
 * 服务器端调试配置管理
 * 用于控制 Cloudflare Workers 中的调试输出
 */

export interface ServerDebugConfig {
    enabled: boolean;
    modules: {
        [key: string]: boolean;
    };
    levels: {
        log: boolean;
        info: boolean;
        warn: boolean;
        error: boolean;
        debug: boolean;
    };
}

// 默认调试配置 - 默认关闭所有调试输出
const DEFAULT_DEBUG_CONFIG: ServerDebugConfig = {
    enabled: false, // 🎯 主控制开关 - 默认关闭
    modules: {
        auth: false,
        products: false, // 🔒 products模块默认关闭
        static: false,
        media: false,
        admin: false,
        middleware: false,
        utils: false,
        database: false
    },
    levels: {
        log: true,
        info: true,
        warn: true,
        error: true,  // 错误始终显示
        debug: true
    }
};

// 全局调试配置实例
let debugConfig: ServerDebugConfig = { ...DEFAULT_DEBUG_CONFIG };

/**
 * 服务器端调试工具类
 */
export class ServerDebugUtils {
    /**
     * 检查模块调试是否启用
     */
    static isEnabled(module: string): boolean {
        // 如果全局调试关闭，则关闭所有调试输出（除了错误）
        if (!debugConfig.enabled) {
            return false;
        }
        
        // 检查模块是否启用
        return debugConfig.modules[module.toLowerCase()] || false;
    }

    /**
     * 日志输出
     */
    static log(module: string, message: string, ...args: any[]): void {
        if (this.isEnabled(module) && debugConfig.levels.log) {
            const timestamp = new Date().toISOString();
            const moduleTag = `[${module.toUpperCase()}]`;
            console.log(`📝 ${timestamp} ${moduleTag}`, message, ...args);
        }
    }

    /**
     * 信息输出
     */
    static info(module: string, message: string, ...args: any[]): void {
        if (this.isEnabled(module) && debugConfig.levels.info) {
            const timestamp = new Date().toISOString();
            const moduleTag = `[${module.toUpperCase()}]`;
            console.log(`ℹ️ ${timestamp} ${moduleTag}`, message, ...args);
        }
    }

    /**
     * 警告输出
     */
    static warn(module: string, message: string, ...args: any[]): void {
        if (this.isEnabled(module) && debugConfig.levels.warn) {
            const timestamp = new Date().toISOString();
            const moduleTag = `[${module.toUpperCase()}]`;
            console.warn(`⚠️ ${timestamp} ${moduleTag}`, message, ...args);
        }
    }

    /**
     * 错误输出（始终显示）
     */
    static error(module: string, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const moduleTag = `[${module.toUpperCase()}]`;
        console.error(`❌ ${timestamp} ${moduleTag}`, message, ...args);
    }

    /**
     * 成功输出
     */
    static success(module: string, message: string, ...args: any[]): void {
        if (this.isEnabled(module) && debugConfig.levels.log) {
            const timestamp = new Date().toISOString();
            const moduleTag = `[${module.toUpperCase()}]`;
            console.log(`✅ ${timestamp} ${moduleTag}`, message, ...args);
        }
    }

    /**
     * 调试输出
     */
    static debug(module: string, message: string, ...args: any[]): void {
        if (this.isEnabled(module) && debugConfig.levels.debug) {
            const timestamp = new Date().toISOString();
            const moduleTag = `[${module.toUpperCase()}]`;
            console.log(`🔍 ${timestamp} ${moduleTag}`, message, ...args);
        }
    }
}

/**
 * 调试控制函数
 */
export class ServerDebugControls {
    /**
     * 启用全局调试
     */
    static enableDebug(): void {
        debugConfig.enabled = true;
        console.log('🔍 服务器端全局调试已启用');
    }

    /**
     * 关闭全局调试
     */
    static disableDebug(): void {
        debugConfig.enabled = false;
        console.log('🔍 服务器端全局调试已关闭');
    }

    /**
     * 开发者模式（启用所有调试）
     */
    static devMode(): void {
        debugConfig.enabled = true;
        Object.keys(debugConfig.modules).forEach(module => {
            debugConfig.modules[module] = true;
        });
        console.log('👷 服务器端开发者模式已启用');
    }

    /**
     * 生产模式（关闭所有调试）
     */
    static prodMode(): void {
        debugConfig.enabled = false;
        Object.keys(debugConfig.modules).forEach(module => {
            debugConfig.modules[module] = false;
        });
        console.log('🏭 服务器端生产模式已启用');
    }

    /**
     * 控制指定模块的调试
     */
    static setModuleDebug(module: string, enabled: boolean): void {
        debugConfig.modules[module.toLowerCase()] = enabled;
        const status = enabled ? '启用' : '关闭';
        console.log(`📁 服务器端模块 ${module} 调试已${status}`);
    }

    /**
     * 获取当前配置
     */
    static getConfig(): ServerDebugConfig {
        return { ...debugConfig };
    }

    /**
     * 显示当前配置
     */
    static showConfig(): void {
        console.group('🔧 服务器端调试配置');
        console.log('🔍 全局调试:', debugConfig.enabled ? '启用' : '关闭');
        console.log('📁 模块状态:');
        Object.entries(debugConfig.modules).forEach(([module, enabled]) => {
            console.log(`  ${enabled ? '✅' : '❌'} ${module}`);
        });
        console.groupEnd();
    }
}

/**
 * 环境检测和自动配置
 */
export function initServerDebugConfig(env?: any): void {
    // 检查环境变量或开发环境
    const isDevelopment = env?.NODE_ENV !== 'production';
    
    // 确保默认关闭所有调试输出
    debugConfig.enabled = false;
    debugConfig.modules.products = false;
    
    if (isDevelopment) {
        // 开发环境也默认关闭，需要手动启用
        console.log('🔧 服务器端调试系统已初始化（开发环境） - 调试输出已关闭');
    } else {
        // 生产环境确保关闭所有调试
        ServerDebugControls.prodMode();
        console.log('🏠 服务器端调试系统已初始化（生产环境） - 所有调试输出已关闭');
    }
}

// 导出便捷别名
export const ServerDebug = ServerDebugUtils;
export const ServerDebugControl = ServerDebugControls;

// 默认导出调试工具
export default ServerDebugUtils;