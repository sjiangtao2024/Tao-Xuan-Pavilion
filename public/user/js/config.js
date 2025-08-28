/**
 * 应用配置文件
 * 包含全局变量、API配置和应用设置
 */

// 应用配置
window.APP_CONFIG = {
    // API配置
    API_BASE_URL: window.location.origin,
    
    // Google OAuth 配置
    GOOGLE_OAUTH: {
        CLIENT_ID: 'your-google-client-id.googleusercontent.com', // 更换为真实的Google OAuth Client ID
        ENABLED: true, // 设置为true以启用Google OAuth（当前为演示模式）
        REDIRECT_URI: window.location.origin + '/oauth/callback' // OAuth重定向URI
    },
    
    // 应用设置
    DEFAULT_LANGUAGE: 'en',
    SUPPORTED_LANGUAGES: ['en', 'zh'],
    
    // 分页设置
    PRODUCTS_PER_PAGE: 12,
    
    // 缓存设置
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟
    
    // 媒体配置
    PLACEHOLDER_IMAGE: '/placeholder.svg',
    
    // 购物车设置
    MAX_CART_ITEMS: 99,
    
    // UI设置
    ANIMATION_DURATION: 300,
    MESSAGE_DISPLAY_DURATION: 3000,
    
    // 调试模式配置
    DEBUG: true,
    DEBUG_MODULES: {
        all: false,
        app: false,
        auth: true,
        cart: true,
        shop: false,
        product: false,
        profile: false,
        navigation: false,
        modal: false,
        message: false,
        carousel: false,
        i18n: false,
        config: false,
        api: false,
        utils: false
    },
    
    // 本地存储键名
    STORAGE_KEYS: {
        TOKEN: 'taoistShopToken',
        USER: 'taoistShopUser',
        CART: 'taoistShopCart',
        LANGUAGE: 'taoistShopLanguage',
        THEME: 'taoistShopTheme'
    }
};

// 全局状态
window.APP_STATE = {
    user: null,
    cart: { items: [] },
    currentLang: 'en',
    currentPage: 'home',
    currentProductId: null,
    isLoading: false,
    allProducts: [],
    categories: [],
    searchQuery: '',
    currentCategory: null
};

// API端点配置
window.API_ENDPOINTS = {
    // 认证相关
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        PROFILE: '/api/auth/profile',
        REFRESH: '/api/auth/refresh'
    },
    
    // 产品相关
    PRODUCTS: {
        LIST: '/api/products',
        DETAIL: '/api/products/:id',
        SEARCH: '/api/products/search',
        CATEGORIES: '/api/products/categories',
        FEATURED: '/api/products/featured'
    },
    
    // 购物车相关
    CART: {
        GET: '/api/cart',
        ADD_ITEM: '/api/cart/items',
        UPDATE_ITEM: '/api/cart/items',  // + /:itemId
        REMOVE_ITEM: '/api/cart/items',  // + /:itemId
        CHECKOUT: '/api/cart/checkout'
    },
    
    // 用户相关
    USER: {
        PROFILE: '/api/user/profile',
        UPDATE_PROFILE: '/api/user/profile',
        ORDERS: '/api/user/orders',
        FAVORITES: '/api/user/favorites'
    }
};

// 事件名称常量
window.APP_EVENTS = {
    // 页面事件
    PAGE_CHANGED: 'page-changed',
    
    // 用户事件
    USER_LOGIN: 'user-login',
    USER_LOGOUT: 'user-logout',
    USER_UPDATED: 'user-updated',
    
    // 购物车事件
    CART_UPDATED: 'cart-updated',
    CART_ITEM_ADDED: 'cart-item-added',
    CART_ITEM_REMOVED: 'cart-item-removed',
    
    // 产品事件
    PRODUCT_LOADED: 'product-loaded',
    PRODUCTS_LOADED: 'products-loaded',
    
    // 语言事件
    LANGUAGE_CHANGED: 'language-changed',
    
    // UI事件
    MODAL_OPENED: 'modal-opened',
    MODAL_CLOSED: 'modal-closed',
    MESSAGE_SHOWN: 'message-shown'
};

// 错误消息
window.ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    CART_FULL: 'Your cart is full. Maximum items allowed: ' + window.APP_CONFIG.MAX_CART_ITEMS,
    PRODUCT_NOT_AVAILABLE: 'This product is currently not available.',
    LOGIN_REQUIRED: 'Please login to add items to cart.'
};

// 成功消息
window.SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logout successful!',
    REGISTER_SUCCESS: 'Registration successful! Please login.',
    PROFILE_UPDATED: 'Profile updated successfully!',
    ITEM_ADDED_TO_CART: 'Item added to cart successfully!',
    ITEM_REMOVED_FROM_CART: 'Item removed from cart.',
    CART_CLEARED: 'Cart cleared successfully.',
    ORDER_PLACED: 'Order placed successfully!'
};

// 增强的调试工具
window.DEBUG_UTILS = {
    // 检查模块调试是否开启
    isEnabled: function(module) {
        return window.APP_CONFIG.DEBUG || 
               window.APP_CONFIG.DEBUG_MODULES.all || 
               window.APP_CONFIG.DEBUG_MODULES[module.toLowerCase()];
    },
    
    // 日志输出
    log: function(module, message, data) {
        if (this.isEnabled(module)) {
            const timestamp = new Date().toLocaleTimeString();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.log(`📝 ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.log(`📝 ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 警告输出
    warn: function(module, message, data) {
        if (this.isEnabled(module)) {
            const timestamp = new Date().toLocaleTimeString();
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
        const timestamp = new Date().toLocaleTimeString();
        const moduleTag = `[${module.toUpperCase()}]`;
        if (data !== undefined) {
            console.error(`❌ ${timestamp} ${moduleTag}`, message, data);
        } else {
            console.error(`❌ ${timestamp} ${moduleTag}`, message);
        }
    },
    
    // 成功输出
    success: function(module, message, data) {
        if (this.isEnabled(module)) {
            const timestamp = new Date().toLocaleTimeString();
            const moduleTag = `[${module.toUpperCase()}]`;
            if (data !== undefined) {
                console.log(`✅ ${timestamp} ${moduleTag}`, message, data);
            } else {
                console.log(`✅ ${timestamp} ${moduleTag}`, message);
            }
        }
    },
    
    // 显示应用状态
    state: function() {
        if (window.APP_CONFIG.DEBUG || window.APP_CONFIG.DEBUG_MODULES.all) {
            console.group('📊 应用状态');
            console.log('🎯 当前页面:', window.APP_STATE.currentPage);
            console.log('🌍 当前语言:', window.APP_STATE.currentLang);
            console.log('👤 用户状态:', window.APP_STATE.user ? '已登录' : '未登录');
            console.log('🛒 购物车数量:', window.APP_STATE.cart.items.length);
            console.log('📈 产品数量:', window.APP_STATE.allProducts.length);
            console.log('🔄 完整状态:', window.APP_STATE);
            console.groupEnd();
        }
    },
    
    // 显示调试配置
    config: function() {
        console.group('🔧 调试配置');
        console.log('🔍 全局调试:', window.APP_CONFIG.DEBUG ? '开启' : '关闭');
        console.log('🎯 所有模块:', window.APP_CONFIG.DEBUG_MODULES.all ? '开启' : '关闭');
        console.log('📁 模块调试状态:');
        Object.entries(window.APP_CONFIG.DEBUG_MODULES).forEach(([module, enabled]) => {
            if (module !== 'all') {
                console.log(`  ${enabled ? '✅' : '❌'} ${module}`);
            }
        });
        console.groupEnd();
    }
};

// 全局调试控制函数
window.DEBUG_CONTROLS = {
    // 启用全局调试模式
    enableDebug: function() {
        window.APP_CONFIG.DEBUG = true;
        console.log('🔍 全局调试模式已启用');
        return '调试模式已启用';
    },
    
    // 关闭全局调试模式
    disableDebug: function() {
        window.APP_CONFIG.DEBUG = false;
        console.log('🔍 全局调试模式已关闭');
        return '调试模式已关闭';
    },
    
    // 开发者模式（显示所有调试信息）
    debugDev: function() {
        window.APP_CONFIG.DEBUG = true;
        window.APP_CONFIG.DEBUG_MODULES.all = true;
        console.log('👷 开发者模式已启用（显示所有调试信息）');
        return '开发者模式已启用';
    },
    
    // 生产模式（关闭所有调试信息）
    debugProd: function() {
        window.APP_CONFIG.DEBUG = false;
        window.APP_CONFIG.DEBUG_MODULES.all = false;
        Object.keys(window.APP_CONFIG.DEBUG_MODULES).forEach(module => {
            window.APP_CONFIG.DEBUG_MODULES[module] = false;
        });
        console.log('🏭 生产模式已启用（关闭所有调试信息）');
        return '生产模式已启用';
    },
    
    // 控制指定模块的调试信息
    debugModule: function(moduleName, enabled = true) {
        if (window.APP_CONFIG.DEBUG_MODULES.hasOwnProperty(moduleName)) {
            window.APP_CONFIG.DEBUG_MODULES[moduleName] = enabled;
            const status = enabled ? '开启' : '关闭';
            console.log(`📁 模块 ${moduleName} 调试信息已${status}`);
            return `模块 ${moduleName} 调试信息已${status}`;
        } else {
            console.warn(`⚠️ 模块 ${moduleName} 不存在`);
            return `模块 ${moduleName} 不存在`;
        }
    },
    
    // 显示当前调试配置
    showDebugConfig: function() {
        window.DEBUG_UTILS.config();
        return '调试配置已显示在控制台';
    },
    
    // 显示帮助信息
    help: function() {
        console.group('📚 调试控制帮助');
        console.log('📈 enableDebug() - 启用全局调试模式');
        console.log('📉 disableDebug() - 关闭全局调试模式');
        console.log('👷 debugDev() - 开发者模式（显示所有调试信息）');
        console.log('🏭 debugProd() - 生产模式（关闭所有调试信息）');
        console.log('📁 debugModule("moduleName", true/false) - 控制指定模块的调试信息显示');
        console.log('🔧 showDebugConfig() - 显示当前调试配置');
        console.log('📊 DEBUG_UTILS.state() - 显示应用状态');
        console.log('🔍 testAPI() - 测试API连接');
        console.log('🧪 validateModules() - 验证模块系统');
        console.log('');
        console.log('📝 使用示例:');
        console.log('  enableDebug()           // 启用全局调试');
        console.log('  debugModule("shop", true)  // 只显示商店模块调试信息');
        console.log('  debugDev()              // 开发者模式');
        console.log('  debugProd()             // 生产模式');
        console.log('  testAPI()               // 测试API连接');
        console.groupEnd();
        return '帮助信息已显示在控制台';
    },
    
    // 测试API连接
    testAPI: async function() {
        console.group('🔍 API连接测试');
        
        const testEndpoints = [
            { name: '产品列表', url: '/api/products?lang=en' },
            { name: '产品分类', url: '/api/products/categories?lang=en' },
            { name: '健康检查', url: '/api/health' }
        ];
        
        for (const endpoint of testEndpoints) {
            try {
                console.log(`🧪 测试 ${endpoint.name}: ${endpoint.url}`);
                const response = await fetch(endpoint.url);
                const status = response.status;
                const statusText = response.statusText;
                
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log(`✅ ${endpoint.name}: ${status} ${statusText}`);
                        if (endpoint.name === '产品列表' && Array.isArray(data)) {
                            console.log(`   📦 找到 ${data.length} 个产品`);
                        }
                    } catch (e) {
                        console.log(`✅ ${endpoint.name}: ${status} ${statusText} (非JSON响应)`);
                    }
                } else {
                    console.error(`❌ ${endpoint.name}: ${status} ${statusText}`);
                }
            } catch (error) {
                console.error(`❌ ${endpoint.name}: 网络错误`, error.message);
            }
        }
        
        console.groupEnd();
        return 'API测试完成，请查看控制台结果';
    },
    
    // 验证模块系统
    validateModules: function() {
        if (typeof window.validateModularSystem === 'function') {
            return window.validateModularSystem();
        } else {
            console.warn('⚠️ 模块验证系统未加载');
            return false;
        }
    }
};

// 全局快捷函数（方便在控制台中直接调用）
window.enableDebug = window.DEBUG_CONTROLS.enableDebug;
window.disableDebug = window.DEBUG_CONTROLS.disableDebug;
window.debugDev = window.DEBUG_CONTROLS.debugDev;
window.debugProd = window.DEBUG_CONTROLS.debugProd;
window.debugModule = window.DEBUG_CONTROLS.debugModule;
window.showDebugConfig = window.DEBUG_CONTROLS.showDebugConfig;
window.debugHelp = window.DEBUG_CONTROLS.help;
window.testAPI = window.DEBUG_CONTROLS.testAPI;
window.validateModules = window.DEBUG_CONTROLS.validateModules;

// 初始化配置
(function initializeConfig() {
    // 从本地存储恢复语言设置
    const savedLanguage = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && window.APP_CONFIG.SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        window.APP_STATE.currentLang = savedLanguage;
    } else {
        window.APP_STATE.currentLang = window.APP_CONFIG.DEFAULT_LANGUAGE;
    }
    
    // 从本地存储恢复用户信息
    try {
        const savedUser = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.USER);
        if (savedUser) {
            window.APP_STATE.user = JSON.parse(savedUser);
        }
    } catch (error) {
        console.warn('Failed to restore user from localStorage:', error);
        localStorage.removeItem(window.APP_CONFIG.STORAGE_KEYS.USER);
    }
    
    // 从本地存储恢复购物车
    try {
        const savedCart = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.CART);
        if (savedCart) {
            window.APP_STATE.cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.warn('Failed to restore cart from localStorage:', error);
        localStorage.removeItem(window.APP_CONFIG.STORAGE_KEYS.CART);
    }
    
    // 显示初始化成功信息
    window.DEBUG_UTILS.success('config', '配置模块初始化成功');
    window.DEBUG_UTILS.log('config', '应用状态已初始化', {
        language: window.APP_STATE.currentLang,
        hasUser: !!window.APP_STATE.user,
        cartItems: window.APP_STATE.cart.items.length
    });
})();

// 显示初始化信息
window.DEBUG_UTILS.success('config', '配置文件加载完成');

// 显示调试帮助信息（只在调试模式下显示）
if (window.APP_CONFIG.DEBUG || window.APP_CONFIG.DEBUG_MODULES.all) {
    console.log('');
    console.log('🔧 调试控制命令已可用，输入 debugHelp() 查看帮助');
    console.log('');
}