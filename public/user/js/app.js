/**
 * 主应用控制器
 * 协调所有模块，管理应用生命周期
 */

window.App = {
    // 应用状态
    isInitialized: false,
    
    // 模块列表
    modules: [],
    
    // 初始化应用
    init: function() {
        if (this.isInitialized) {
            window.DEBUG_UTILS.warn('app', 'App already initialized');
            return;
        }
        
        window.DEBUG_UTILS.log('app', '初始化应用程序...');
        
        try {
            // 初始化各个模块
            this.initializeModules();
            
            // 初始化Google OAuth（如果启用）
            this.initializeGoogleOAuth();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 应用启动完成
            this.isInitialized = true;
            
            // 触发应用初始化完成事件
            window.EventUtils.emit('app-initialized');
            
            // 延迟检查认证状态，确保所有模块都已初始化
            setTimeout(() => {
                this.checkAuthStatus();
            }, 100);
            
            window.DEBUG_UTILS.success('app', '应用初始化成功');
            
        } catch (error) {
            window.DEBUG_UTILS.error('app', '应用初始化失败:', error);
            this.handleInitializationError(error);
        }
    },
    
    // 初始化模块
    initializeModules: function() {
        const moduleInitOrder = [
            // 基础模块优先初始化
            'I18nManager',
            'ModalComponent', 
            'MessageComponent',
            'CarouselComponent',
            
            // 核心功能模块
            'AuthModule',
            'CartModule',
            'ShopModule',
            'ProductModule',
            'ProfileModule',
            'NavigationModule'
        ];
        
        moduleInitOrder.forEach(moduleName => {
            try {
                const module = window[moduleName];
                if (module && typeof module.init === 'function') {
                    module.init();
                    this.modules.push(moduleName);
                    window.DEBUG_UTILS.log('app', `Module initialized: ${moduleName}`);
                } else {
                    window.DEBUG_UTILS.warn('app', `Module not found or missing init method: ${moduleName}`);
                }
            } catch (error) {
                window.DEBUG_UTILS.error('app', `Failed to initialize module ${moduleName}:`, error);
            }
        });
    },
        
    // 初始化Google OAuth
    initializeGoogleOAuth: function() {
        if (window.APP_CONFIG.GOOGLE_OAUTH.ENABLED) {
            if (window.GoogleOAuth) {
                window.GoogleOAuth.init();
                window.DEBUG_UTILS.log('app', 'Google OAuth initialization started');
            } else {
                window.DEBUG_UTILS.warn('app', 'GoogleOAuth module not found');
            }
        } else {
            window.DEBUG_UTILS.log('app', 'Google OAuth disabled or not configured');
        }
    },
    
    // 绑定全局事件
    bindGlobalEvents: function() {
        // 窗口大小变化事件
        window.addEventListener('resize', window.EventUtils.throttle(() => {
            this.handleWindowResize();
        }, 250));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 在线/离线状态
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });
        
        // 全局错误处理
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        // Promise rejection 处理
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event);
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
        
        window.DEBUG_UTILS.log('app', 'Global events bound');
    },
    
    // 检查认证状态
    checkAuthStatus: async function() {
        if (window.AuthModule && typeof window.AuthModule.checkAuthStatus === 'function') {
            try {
                await window.AuthModule.checkAuthStatus();
            } catch (error) {
                window.DEBUG_UTILS.warn('app', 'Auth status check failed:', error);
            }
        }
    },
    
    // 处理窗口大小变化
    handleWindowResize: function() {
        // 更新视口单位
        this.updateViewportUnits();
        
        // 通知相关模块
        window.EventUtils.emit('window-resized', {
            width: window.innerWidth,
            height: window.innerHeight
        });
        
        window.DEBUG_UTILS.log('app', `Window resized: ${window.innerWidth}x${window.innerHeight}`);
    },
    
    // 更新视口单位
    updateViewportUnits: function() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },
    
    // 处理页面可见性变化
    handleVisibilityChange: function() {
        if (document.hidden) {
            // 页面隐藏时暂停某些活动
            this.pauseActivities();
        } else {
            // 页面显示时恢复活动
            this.resumeActivities();
        }
        
        window.DEBUG_UTILS.log('app', `Page visibility changed: ${document.hidden ? 'hidden' : 'visible'}`);
    },
    
    // 暂停活动
    pauseActivities: function() {
        // 暂停轮播图自动播放
        if (window.CarouselComponent) {
            window.CarouselComponent.instances.forEach(carousel => {
                if (carousel.isPlaying) {
                    window.CarouselComponent.pauseAutoPlay(carousel);
                    carousel._wasPausedByApp = true;
                }
            });
        }
    },
    
    // 恢复活动
    resumeActivities: function() {
        // 恢复轮播图自动播放
        if (window.CarouselComponent) {
            window.CarouselComponent.instances.forEach(carousel => {
                if (carousel._wasPausedByApp) {
                    window.CarouselComponent.resumeAutoPlay(carousel);
                    delete carousel._wasPausedByApp;
                }
            });
        }
    },
    
    // 处理在线/离线状态变化
    handleOnlineStatusChange: function(isOnline) {
        if (isOnline) {
            window.MessageComponent.success(window.t('backOnline', 'Connection restored!'));
            // 重新同步数据
            this.syncData();
        } else {
            window.MessageComponent.warning(window.t('offline', 'You are currently offline. Some features may not work.'));
        }
        
        window.DEBUG_UTILS.log('app', `Network status: ${isOnline ? 'online' : 'offline'}`);
    },
    
    // 同步数据
    syncData: function() {
        // 同步购物车数据
        if (window.CartModule && typeof window.CartModule.syncWithServer === 'function') {
            window.CartModule.syncWithServer();
        }
        
        // 同步其他需要同步的数据
    },
    
    // 处理全局错误
    handleGlobalError: function(event) {
        const error = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        };
        
        window.DEBUG_UTILS.error('app', 'Global error occurred:', error);
        
        // 在生产环境中可以发送错误报告到服务器
        if (!window.APP_CONFIG.DEBUG) {
            this.reportError(error);
        }
    },
    
    // 处理未捕获的Promise rejection
    handleUnhandledRejection: function(event) {
        const error = {
            reason: event.reason,
            promise: event.promise
        };
        
        window.DEBUG_UTILS.error('app', 'Unhandled promise rejection:', error);
        
        // 阻止在控制台显示错误
        event.preventDefault();
        
        if (!window.APP_CONFIG.DEBUG) {
            this.reportError(error);
        }
    },
    
    // 处理键盘快捷键
    handleKeyboardShortcuts: function(event) {
        // Ctrl/Cmd + K: 搜索
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusSearch();
        }
        
        // Esc: 关闭模态框
        if (event.key === 'Escape') {
            if (window.ModalComponent && window.ModalComponent.currentModal) {
                window.ModalComponent.close();
            }
        }
        
        // Alt + H: 回到首页
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            if (window.NavigationModule) {
                window.NavigationModule.navigateTo('home');
            }
        }
    },
    
    // 聚焦搜索框
    focusSearch: function() {
        const searchInput = window.DOMUtils.get('#search-input');
        if (searchInput) {
            searchInput.focus();
        } else {
            // 如果不在商店页面，先导航到商店页面
            if (window.NavigationModule) {
                window.NavigationModule.navigateTo('shop');
                setTimeout(() => {
                    const searchInput = window.DOMUtils.get('#search-input');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 500);
            }
        }
    },
    
    // 报告错误（生产环境使用）
    reportError: function(error) {
        // 这里可以实现错误报告功能
        // 例如发送到错误监控服务
        console.log('Error reported:', error);
    },
    
    // 处理初始化错误
    handleInitializationError: function(error) {
        // 显示友好的错误页面
        document.body.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background-color: #1C1C1C; 
                color: #EAE0C8; 
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1 style="color: #A88F5A; margin-bottom: 20px;">应用初始化失败</h1>
                    <p style="margin-bottom: 20px;">很抱歉，应用在初始化过程中遇到了问题。</p>
                    <button onclick="location.reload()" style="
                        background-color: #B83B1D; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 4px; 
                        cursor: pointer;
                    ">重新加载</button>
                </div>
            </div>
        `;
    },
    
    // 获取应用状态
    getState: function() {
        return {
            isInitialized: this.isInitialized,
            currentPage: window.NavigationModule ? window.NavigationModule.getCurrentPage() : null,
            user: window.AuthModule ? window.AuthModule.getCurrentUser() : null,
            cartItemCount: window.CartModule ? window.CartModule.getTotalItems() : 0,
            currentLanguage: window.I18nManager ? window.I18nManager.getCurrentLanguage() : 'en'
        };
    },
    
    // 重启应用
    restart: function() {
        window.location.reload();
    },
    
    // 销毁应用
    destroy: function() {
        // 清理事件监听器
        // 清理模块资源
        // 重置状态
        this.isInitialized = false;
        this.modules = [];
        
        window.DEBUG_UTILS.log('app', 'Application destroyed');
    }
};

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 确保所有依赖都已加载
    if (typeof window.APP_CONFIG !== 'undefined' && 
        typeof window.DEBUG_UTILS !== 'undefined') {
        window.App.init();
    } else {
        console.error('Missing dependencies for app initialization');
    }
});

window.DEBUG_UTILS.log('app', 'App controller loaded');