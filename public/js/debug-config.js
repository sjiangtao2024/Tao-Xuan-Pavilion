/**
 * 全局调试配置
 * 统一管理所有模块的调试输出
 */

window.DEBUG_CONFIG = {
    // 主开关 - 设置为false可以完全关闭所有调试输出
    enabled: false,  // 默认关闭调试模式
    
    // 各模块的调试开关
    modules: {
        productManagement: false,   // 产品管理模块
        productForm: false,         // 产品表单模块  
        productEditor: false,       // 产品编辑器模块
        productMedia: false,        // 产品媒体模块
        categoryManagement: false,  // 分类管理模块
        userManagement: false,      // 用户管理模块
        admin: false                // 管理界面主控制器
    },
    
    // 调试级别
    levels: {
        info: false,    // 信息日志 - 默认关闭
        warn: true,     // 警告日志
        error: true,    // 错误日志（建议始终开启）
        debug: false    // 详细调试日志 - 默认关闭
    }
};

/**
 * 统一的调试日志函数
 * @param {string} module - 模块名称
 * @param {string} level - 日志级别 (info, warn, error, debug)
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
window.debugLog = function(module, level, message, ...args) {
    // 检查主开关
    if (!window.DEBUG_CONFIG.enabled) {
        return;
    }
    
    // 检查模块开关
    if (!window.DEBUG_CONFIG.modules[module]) {
        return;
    }
    
    // 检查级别开关
    if (!window.DEBUG_CONFIG.levels[level]) {
        return;
    }
    
    // 输出日志
    const prefix = `[${module.toUpperCase()}]`;
    switch (level) {
        case 'error':
            console.error(prefix, message, ...args);
            break;
        case 'warn':
            console.warn(prefix, message, ...args);
            break;
        case 'debug':
            console.debug(prefix, message, ...args);
            break;
        case 'info':
        default:
            console.log(prefix, message, ...args);
            break;
    }
};

// 便捷函数
window.debugInfo = (module, message, ...args) => window.debugLog(module, 'info', message, ...args);
window.debugWarn = (module, message, ...args) => window.debugLog(module, 'warn', message, ...args);
window.debugError = (module, message, ...args) => window.debugLog(module, 'error', message, ...args);
window.debugDebug = (module, message, ...args) => window.debugLog(module, 'debug', message, ...args);

// 快速控制函数
window.enableDebug = () => {
    window.DEBUG_CONFIG.enabled = true;
    console.log('🔧 调试模式已启用');
};

window.disableDebug = () => {
    window.DEBUG_CONFIG.enabled = false;
    console.log('🔇 调试模式已关闭');
};

window.toggleDebug = () => {
    window.DEBUG_CONFIG.enabled = !window.DEBUG_CONFIG.enabled;
    console.log(`🔄 调试模式已${window.DEBUG_CONFIG.enabled ? '启用' : '关闭'}`);
};

// 显示调试配置
window.showDebugConfig = () => {
    console.log('🔧 当前调试配置:', window.DEBUG_CONFIG);
};

// 开发者快捷控制函数
window.debugDev = () => {
    window.DEBUG_CONFIG.enabled = true;
    window.DEBUG_CONFIG.levels.debug = true;
    window.DEBUG_CONFIG.levels.info = true;
    console.log('🔧 开发者调试模式已启用（显示所有信息）');
};

window.debugProd = () => {
    window.DEBUG_CONFIG.enabled = false;
    console.log('🔇 生产模式已启用（关闭所有调试输出）');
};

// 模块级别控制
window.debugModule = (moduleName, enabled = true) => {
    if (window.DEBUG_CONFIG.modules.hasOwnProperty(moduleName)) {
        window.DEBUG_CONFIG.modules[moduleName] = enabled;
        console.log(`🔧 模块 ${moduleName} 调试已${enabled ? '启用' : '关闭'}`);
    } else {
        console.warn('⚠️ 未知模块:', moduleName);
        console.log('📋 可用模块:', Object.keys(window.DEBUG_CONFIG.modules));
    }
};

console.log('🔧 调试配置系统已加载 - 静默模式');
// 默认关闭提示信息，如需查看提示，请运行 showDebugHelp()
window.showDebugHelp = () => {
    console.log('💡 调试系统使用提示:');
    console.log('   enableDebug()  - 启用调试模式');
    console.log('   disableDebug() - 关闭调试模式');
    console.log('   debugDev()     - 开发者模式（显示所有）');
    console.log('   debugProd()    - 生产模式（关闭所有）');
    console.log('   debugModule("moduleName", true/false) - 控制指定模块');
    console.log('   showDebugConfig() - 显示当前配置');
};