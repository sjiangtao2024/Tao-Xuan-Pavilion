/**
 * 管理后台调试配置系统
 * 参考用户界面 config.js 的调试配置模式
 * 支持环境检测、智能控制和便捷操作
 */

// 环境检测
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isProduction = !isDevelopment;

window.ADMIN_DEBUG_CONFIG = {
    // 环境信息
    ENVIRONMENT: {
        IS_DEVELOPMENT: isDevelopment,
        IS_PRODUCTION: isProduction,
        HOSTNAME: window.location.hostname
    },
    
    // 主开关 - 开发环境默认关闭（减少噪音），生产环境默认关闭
    enabled: false,
    
    // 各模块的调试开关
    modules: {
        all: false,                 // 全部模块总开关
        admin: false,               // 管理界面主控制器
        productManagement: false,   // 产品管理模块
        productForm: false,         // 产品表单模块  
        productEditor: false,       // 产品编辑器模块
        productMedia: false,        // 产品媒体模块
        categoryManagement: false,  // 分类管理模块
        userManagement: false,      // 用户管理模块
        navigation: false,          // 导航模块
        api: false                  // API调用
    },
    
    // 调试级别
    levels: {
        info: false,            // 信息日志
        warn: true,             // 警告日志 - 始终开启
        error: true,            // 错误日志 - 始终开启
        debug: false,           // 详细调试日志
        success: false          // 成功日志
    }
};

// 增强的调试工具类
window.ADMIN_DEBUG_UTILS = {
    // 检查模块调试是否开启
    isEnabled: function(module, level = 'info') {
        const config = window.ADMIN_DEBUG_CONFIG;
        
        // 错误和警告始终显示
        if (level === 'error' || level === 'warn') {
            return config.levels[level];
        }
        
        // 如果全局DEBUG为false，则关闭其他调试信息
        if (!config.enabled) {
            return false;
        }
        
        // 检查级别开关
        if (!config.levels[level]) {
            return false;
        }
        
        // 检查模块开关
        return config.modules.all || config.modules[module.toLowerCase()];
    },
    
    // 格式化时间戳
    getTimestamp: function() {
        return new Date().toLocaleTimeString('zh-CN', { hour12: false });
    },
    
    // 日志输出
    log: function(module, message, data) {
        if (this.isEnabled(module, 'info')) {
            const timestamp = this.getTimestamp();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.log(`📝 ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.log(`📝 ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 警告输出（始终显示）
    warn: function(module, message, data) {
        if (this.isEnabled(module, 'warn')) {
            const timestamp = this.getTimestamp();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.warn(`⚠️ ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.warn(`⚠️ ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 错误输出（始终显示）
    error: function(module, message, data) {
        if (this.isEnabled(module, 'error')) {
            const timestamp = this.getTimestamp();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.error(`❌ ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.error(`❌ ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 调试输出
    debug: function(module, message, data) {
        if (this.isEnabled(module, 'debug')) {
            const timestamp = this.getTimestamp();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.debug(`🔍 ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.debug(`🔍 ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 成功输出
    success: function(module, message, data) {
        if (this.isEnabled(module, 'success')) {
            const timestamp = this.getTimestamp();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.log(`✅ ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.log(`✅ ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 显示调试配置
    showConfig: function() {
        console.group('🔧 管理后台调试配置');
        console.log('🌍 环境模式:', window.ADMIN_DEBUG_CONFIG.ENVIRONMENT.IS_DEVELOPMENT ? '开发环境' : '生产环境');
        console.log('🔍 全局调试:', window.ADMIN_DEBUG_CONFIG.enabled ? '开启' : '关闭');
        console.log('🎯 所有模块:', window.ADMIN_DEBUG_CONFIG.modules.all ? '开启' : '关闭');
        console.log('📁 模块调试状态:');
        Object.entries(window.ADMIN_DEBUG_CONFIG.modules).forEach(([module, enabled]) => {
            if (module !== 'all') {
                console.log(`  ${enabled ? '✅' : '❌'} ${module}`);
            }
        });
        console.log('📊 级别调试状态:');
        Object.entries(window.ADMIN_DEBUG_CONFIG.levels).forEach(([level, enabled]) => {
            console.log(`  ${enabled ? '✅' : '❌'} ${level}`);
        });
        console.groupEnd();
    }
};

// 全局调试控制函数
window.ADMIN_DEBUG_CONTROLS = {
    // 启用全局调试模式
    enableDebug: function() {
        window.ADMIN_DEBUG_CONFIG.enabled = true;
        console.log('🔧 管理后台调试模式已启用');
        return '调试模式已启用';
    },
    
    // 关闭全局调试模式
    disableDebug: function() {
        window.ADMIN_DEBUG_CONFIG.enabled = false;
        console.log('🔇 管理后台调试模式已关闭');
        return '调试模式已关闭';
    },
    
    // 切换调试模式
    toggleDebug: function() {
        const config = window.ADMIN_DEBUG_CONFIG;
        config.enabled = !config.enabled;
        const status = config.enabled ? '启用' : '关闭';
        console.log(`🔄 管理后台调试模式已${status}`);
        return `调试模式已${status}`;
    },
    
    // 开发者模式（显示所有调试信息）
    debugDev: function() {
        const config = window.ADMIN_DEBUG_CONFIG;
        config.enabled = true;
        config.modules.all = true;
        config.levels.info = true;
        config.levels.debug = true;
        config.levels.success = true;
        console.log('👷 管理后台开发者模式已启用（显示所有调试信息）');
        return '开发者模式已启用';
    },
    
    // 生产模式（关闭所有调试信息，保留错误和警告）
    debugProd: function() {
        const config = window.ADMIN_DEBUG_CONFIG;
        config.enabled = false;
        config.modules.all = false;
        Object.keys(config.modules).forEach(module => {
            if (module !== 'all') {
                config.modules[module] = false;
            }
        });
        config.levels.info = false;
        config.levels.debug = false;
        config.levels.success = false;
        // 保留 error 和 warn 为 true
        console.log('🏭 管理后台生产模式已启用（仅显示错误和警告）');
        return '生产模式已启用';
    },
    
    // 控制指定模块的调试信息
    debugModule: function(moduleName, enabled = true) {
        const config = window.ADMIN_DEBUG_CONFIG;
        if (config.modules.hasOwnProperty(moduleName)) {
            config.modules[moduleName] = enabled;
            const status = enabled ? '开启' : '关闭';
            console.log(`📁 模块 ${moduleName} 调试信息已${status}`);
            return `模块 ${moduleName} 调试信息已${status}`;
        } else {
            console.warn(`⚠️ 模块 ${moduleName} 不存在`);
            console.log('📋 可用模块:', Object.keys(config.modules).filter(m => m !== 'all'));
            return `模块 ${moduleName} 不存在`;
        }
    },
    
    // 控制调试级别
    debugLevel: function(levelName, enabled = true) {
        const config = window.ADMIN_DEBUG_CONFIG;
        if (config.levels.hasOwnProperty(levelName)) {
            config.levels[levelName] = enabled;
            const status = enabled ? '开启' : '关闭';
            console.log(`📊 调试级别 ${levelName} 已${status}`);
            return `调试级别 ${levelName} 已${status}`;
        } else {
            console.warn(`⚠️ 调试级别 ${levelName} 不存在`);
            console.log('📋 可用级别:', Object.keys(config.levels));
            return `调试级别 ${levelName} 不存在`;
        }
    },
    
    // 显示当前调试配置
    showDebugConfig: function() {
        window.ADMIN_DEBUG_UTILS.showConfig();
        return '调试配置已显示在控制台';
    },
    
    // 显示帮助信息
    help: function() {
        console.group('📚 管理后台调试控制帮助');
        console.log('📈 adminEnableDebug() - 启用全局调试模式');
        console.log('📉 adminDisableDebug() - 关闭全局调试模式');
        console.log('🔄 adminToggleDebug() - 切换调试模式');
        console.log('👷 adminDebugDev() - 开发者模式（显示所有调试信息）');
        console.log('🏭 adminDebugProd() - 生产模式（仅显示错误和警告）');
        console.log('📁 adminDebugModule("moduleName", true/false) - 控制指定模块的调试信息');
        console.log('📊 adminDebugLevel("levelName", true/false) - 控制调试级别');
        console.log('🔧 adminShowDebugConfig() - 显示当前调试配置');
        console.log('');
        console.log('📝 使用示例:');
        console.log('  adminEnableDebug()                    // 启用全局调试');
        console.log('  adminDebugModule("productManagement", true)  // 只显示产品管理模块调试信息');
        console.log('  adminDebugDev()                       // 开发者模式');
        console.log('  adminDebugProd()                      // 生产模式');
        console.log('');
        console.log('🎯 可用模块:', Object.keys(window.ADMIN_DEBUG_CONFIG.modules).filter(m => m !== 'all').join(', '));
        console.log('📊 可用级别:', Object.keys(window.ADMIN_DEBUG_CONFIG.levels).join(', '));
        console.groupEnd();
        return '帮助信息已显示在控制台';
    }
};

// 全局快捷函数（方便在控制台中直接调用）
window.adminEnableDebug = window.ADMIN_DEBUG_CONTROLS.enableDebug;
window.adminDisableDebug = window.ADMIN_DEBUG_CONTROLS.disableDebug;
window.adminToggleDebug = window.ADMIN_DEBUG_CONTROLS.toggleDebug;
window.adminDebugDev = window.ADMIN_DEBUG_CONTROLS.debugDev;
window.adminDebugProd = window.ADMIN_DEBUG_CONTROLS.debugProd;
window.adminDebugModule = window.ADMIN_DEBUG_CONTROLS.debugModule;
window.adminDebugLevel = window.ADMIN_DEBUG_CONTROLS.debugLevel;
window.adminShowDebugConfig = window.ADMIN_DEBUG_CONTROLS.showDebugConfig;
window.adminDebugHelp = window.ADMIN_DEBUG_CONTROLS.help;

/**
 * 统一的调试日志函数（兼容旧版本调用方式）
 * @param {string} module - 模块名称
 * @param {string} level - 日志级别 (info, warn, error, debug, success)
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
window.debugLog = function(module, level, message, ...args) {
    const utils = window.ADMIN_DEBUG_UTILS;
    switch (level) {
        case 'error':
            utils.error(module, message, ...args);
            break;
        case 'warn':
            utils.warn(module, message, ...args);
            break;
        case 'debug':
            utils.debug(module, message, ...args);
            break;
        case 'success':
            utils.success(module, message, ...args);
            break;
        case 'info':
        default:
            utils.log(module, message, ...args);
            break;
    }
};

// 便捷函数（兼容旧版本）
window.debugInfo = (module, message, ...args) => window.ADMIN_DEBUG_UTILS.log(module, message, ...args);
window.debugWarn = (module, message, ...args) => window.ADMIN_DEBUG_UTILS.warn(module, message, ...args);
window.debugError = (module, message, ...args) => window.ADMIN_DEBUG_UTILS.error(module, message, ...args);
window.debugDebug = (module, message, ...args) => window.ADMIN_DEBUG_UTILS.debug(module, message, ...args);
window.debugSuccess = (module, message, ...args) => window.ADMIN_DEBUG_UTILS.success(module, message, ...args);

// 兼容旧版本函数名
window.enableDebug = window.adminEnableDebug;
window.disableDebug = window.adminDisableDebug;
window.toggleDebug = window.adminToggleDebug;
window.debugDev = window.adminDebugDev;
window.debugProd = window.adminDebugProd;
window.debugModule = window.adminDebugModule;
window.showDebugConfig = window.adminShowDebugConfig;
window.showDebugHelp = window.adminDebugHelp;

// 初始化配置
(function initializeAdminDebugConfig() {
    const config = window.ADMIN_DEBUG_CONFIG;
    
    // 默认情况下只显示警告和错误
    console.log('🔧 管理后台调试系统已加载');
    
    // 在开发环境中显示额外的提示
    if (config.ENVIRONMENT.IS_DEVELOPMENT) {
        console.log('💡 开发环境检测到，输入 adminDebugHelp() 查看调试控制命令');
        console.log('🎯 快速启用: adminEnableDebug() 或 adminDebugDev()');
    }
    
    // 验证配置完整性
    const requiredModules = ['admin', 'productManagement', 'userManagement', 'categoryManagement'];
    const missingModules = requiredModules.filter(module => !config.modules.hasOwnProperty(module));
    
    if (missingModules.length > 0) {
        console.warn('⚠️ 缺少调试模块配置:', missingModules);
    }
    
    // 显示当前配置（仅在调试模式开启时）
    if (config.enabled || config.modules.all) {
        window.ADMIN_DEBUG_UTILS.log('debug-config', '调试配置初始化完成', {
            环境: config.ENVIRONMENT.IS_DEVELOPMENT ? '开发环境' : '生产环境',
            全局调试: config.enabled ? '开启' : '关闭',
            活跃模块: Object.entries(config.modules).filter(([k, v]) => v && k !== 'all').map(([k]) => k)
        });
    }
})();