/**
 * Google OAuth 模块
 * 处理 Google OAuth 认证流程
 */

window.GoogleOAuth = {
    // 模块初始化状态
    isInitialized: false,
    
    // Google OAuth 配置
    config: {
        clientId: null,
        redirectUri: null
    },
    
    // 初始化 Google OAuth
    init: function() {
        // 从应用配置中获取Google OAuth设置
        if (window.APP_CONFIG && window.APP_CONFIG.GOOGLE_OAUTH) {
            this.config = {
                clientId: window.APP_CONFIG.GOOGLE_OAUTH.CLIENT_ID,
                redirectUri: window.APP_CONFIG.GOOGLE_OAUTH.REDIRECT_URI
            };
            
            // 检查是否启用Google OAuth
            if (window.APP_CONFIG.GOOGLE_OAUTH.ENABLED) {
                if (this.config.clientId && this.config.clientId !== 'your-google-client-id') {
                    // 真实配置：加载Google Identity Services
                    this.loadGoogleScript()
                        .then(() => {
                            this.initializeGoogleAuth();
                        })
                        .catch((error) => {
                            window.DEBUG_UTILS.error('oauth', 'Failed to initialize Google OAuth:', error);
                        });
                } else {
                    window.DEBUG_UTILS.log('oauth', 'Google OAuth Client ID not configured');
                }
            } else {
                window.DEBUG_UTILS.log('oauth', 'Google OAuth disabled in configuration');
            }
        } else {
            window.DEBUG_UTILS.warn('oauth', 'Google OAuth configuration not found');
        }
    },
    

    // 加载Google Identity Services脚本
    loadGoogleScript: function() {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载
            if (window.google && window.google.accounts) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                window.DEBUG_UTILS.log('oauth', 'Google Identity Services script loaded');
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Google Identity Services script'));
            };
            
            document.head.appendChild(script);
        });
    },
    

    // 初始化Google认证
    initializeGoogleAuth: function() {
        try {
            // 检查Client ID是否为占位符或无效
            if (!this.config.clientId || 
                this.config.clientId === 'your-google-client-id.googleusercontent.com' ||
                this.config.clientId === 'your-google-client-id') {
                window.DEBUG_UTILS.warn('oauth', 'Invalid or placeholder Google Client ID detected');
                return;
            }
            
            // 初始化Google Identity Services
            window.google.accounts.id.initialize({
                client_id: this.config.clientId,
                callback: this.handleGoogleResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
            
            this.isInitialized = true;
            window.DEBUG_UTILS.log('oauth', 'Google OAuth initialized successfully');
            
            // 触发初始化完成事件
            window.EventUtils.emit('google-oauth-ready');
            
        } catch (error) {
            window.DEBUG_UTILS.error('oauth', 'Google OAuth initialization failed:', error);
        }
    },
    
    // 显示Google登录按钮
    renderSignInButton: function(containerId, options = {}) {
        if (!this.isInitialized) {
            window.DEBUG_UTILS.warn('oauth', 'Google OAuth not initialized yet');
            return;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            window.DEBUG_UTILS.error('oauth', 'Container not found:', containerId);
            return;
        }
        
        const defaultOptions = {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            window.google.accounts.id.renderButton(
                container,
                mergedOptions
            );
            
            window.DEBUG_UTILS.log('oauth', 'Google sign-in button rendered');
        } catch (error) {
            window.DEBUG_UTILS.error('oauth', 'Failed to render Google sign-in button:', error);
        }
    },
    

    // 程序化触发登录
    signIn: function() {
        if (!this.isInitialized) {
            window.DEBUG_UTILS.warn('oauth', 'Google OAuth not initialized yet');
            return;
        }
        
        try {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    window.DEBUG_UTILS.log('oauth', 'Google sign-in prompt not displayed or skipped');
                }
            });
        } catch (error) {
            window.DEBUG_UTILS.error('oauth', 'Failed to show Google sign-in prompt:', error);
        }
    },
    
    // 处理Google OAuth响应
    handleGoogleResponse: async function(response) {
        try {
            window.DEBUG_UTILS.log('oauth', 'Received Google OAuth response');
            
            // 解码JWT token以获取用户信息
            const payload = this.parseJwt(response.credential);
            
            if (!payload) {
                throw new Error('Invalid Google token');
            }
            
            const googleUser = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified
            };
            
            window.DEBUG_UTILS.log('oauth', 'Google user info:', googleUser);
            
            // 发送到后端进行认证
            const authResponse = await window.APIUtils.post('/api/auth/oauth/google', {
                googleToken: response.credential,
                googleUser: googleUser
            });
            
            if (authResponse.token && authResponse.user) {
                // 保存认证信息
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.TOKEN, authResponse.token);
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.USER, authResponse.user);
                
                // 更新认证模块状态
                if (window.AuthModule) {
                    window.AuthModule.currentUser = authResponse.user;
                    window.APP_STATE.user = authResponse.user;
                    window.AuthModule.updateUI();
                }
                
                // 触发登录成功事件
                window.EventUtils.emit(window.APP_EVENTS.USER_LOGIN, authResponse.user);
                
                // 关闭登录模态框
                if (window.ModalComponent) {
                    window.ModalComponent.close();
                }
                
                // 显示成功消息
                window.MessageComponent.success(window.I18nManager.t('loginSuccess') || 'Login successful!');
                
                window.DEBUG_UTILS.log('oauth', 'Google OAuth login successful:', authResponse.user);
                
                return authResponse.user;
            } else {
                throw new Error(authResponse.error || 'OAuth authentication failed');
            }
            
        } catch (error) {
            window.DEBUG_UTILS.error('oauth', 'Google OAuth authentication failed:', error);
            window.MessageComponent.error(error.message || 'Google login failed');
            throw error;
        }
    },
    
    // 解析JWT token
    parseJwt: function(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            window.DEBUG_UTILS.error('oauth', 'Failed to parse JWT token:', error);
            return null;
        }
    },
    
    // 登出（撤销Google授权）
    signOut: async function() {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            // 撤销Google授权
            window.google.accounts.id.disableAutoSelect();
            
            window.DEBUG_UTILS.log('oauth', 'Google OAuth sign out completed');
        } catch (error) {
            window.DEBUG_UTILS.warn('oauth', 'Google OAuth sign out failed:', error);
        }
    },
    
    // 检查是否支持Google OAuth
    isSupported: function() {
        return !!(window.google && window.google.accounts && window.google.accounts.id);
    }
};

// 扩展模态框组件，添加Google OAuth登录按钮
if (window.ModalComponent) {
    // 保存原始的创建登录模态框方法
    const originalCreateLoginModal = window.ModalComponent.createLoginModal;
    
    window.ModalComponent.createLoginModal = function() {
        // 调用原始方法
        originalCreateLoginModal.call(this);
        
        // 不需要添加额外的内容，因为模态框已经包含了Google OAuth区域
        // setupGoogleOAuth方法会在open方法中被调用
    };
}

// 当Google OAuth准备就绪时，更新已存在的登录模态框
window.EventUtils.on('google-oauth-ready', () => {
    const googleContainer = window.DOMUtils.get('#google-signin-container');
    if (googleContainer) {
        window.GoogleOAuth.renderSignInButton('google-signin-container', {
            theme: 'outline',
            size: 'large',
            width: '300'
        });
    }
});

window.DEBUG_UTILS.log('oauth', 'Google OAuth module loaded');