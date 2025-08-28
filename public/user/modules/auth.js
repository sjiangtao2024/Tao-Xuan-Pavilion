/**
 * 用户认证模块
 * 处理用户登录、注册、退出等认证功能
 */

window.AuthModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前用户信息
    currentUser: null,
    
    // 初始化
    init: function() {
        // 首先尝试从本地存储恢复用户状态
        this.restoreAuthState();
        
        this.bindEvents();
        this.updateUI();
        this.isInitialized = true;
        window.DEBUG_UTILS.log('auth', 'Auth module initialized');
    },
    
    // 从本地存储恢复认证状态
    restoreAuthState: function() {
        try {
            // 从本地存储获取用户信息和token
            const savedUser = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.USER);
            const savedToken = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
            
            if (savedUser && savedToken) {
                // 恢复用户状态
                this.currentUser = savedUser;
                window.APP_STATE.user = savedUser;
                
                window.DEBUG_UTILS.log('auth', 'Auth state restored from localStorage:', savedUser);
            } else {
                window.DEBUG_UTILS.log('auth', 'No saved auth state found');
            }
        } catch (error) {
            window.DEBUG_UTILS.error('auth', 'Failed to restore auth state:', error);
            // 如果恢复失败，清除可能损坏的数据
            this.clearUserData();
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 绑定登录按钮
        const loginButton = window.DOMUtils.get('#login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                window.ModalComponent.open('login-modal');
            });
        }
        
        // 绑定退出按钮
        const logoutButton = window.DOMUtils.get('#logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // 绑定个人资料按钮
        const profileButton = window.DOMUtils.get('#profile-button');
        if (profileButton) {
            profileButton.addEventListener('click', () => {
                if (window.NavigationModule) {
                    window.NavigationModule.navigateTo('profile');
                }
            });
        }
        
        // 监听用户状态变化事件
        window.EventUtils.on(window.APP_EVENTS.USER_LOGIN, () => {
            this.updateUI();
        });
        
        window.EventUtils.on(window.APP_EVENTS.USER_LOGOUT, () => {
            this.updateUI();
        });
    },
    
    // 用户登录
    login: async function(email, password) {
        try {
            window.DEBUG_UTILS.log('auth', 'Attempting login for:', email);
            
            const response = await window.APIUtils.post(window.API_ENDPOINTS.AUTH.LOGIN, {
                email: email,
                password: password
            });
            
            // 根据实际API响应结构判断成功：有token和user字段表示成功
            if (response.token && response.user) {
                // 保存用户信息和token
                this.currentUser = response.user;
                window.APP_STATE.user = response.user;
                
                // 保存到本地存储
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.USER, response.user);
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.TOKEN, response.token);
                
                // 触发登录成功事件
                window.EventUtils.emit(window.APP_EVENTS.USER_LOGIN, response.user);
                
                // 显示成功消息
                window.MessageComponent.success(window.I18nManager.t('loginSuccess') || 'Login successful!');
                
                window.DEBUG_UTILS.log('auth', 'Login successful:', response.user);
                return response.user;
            } else {
                throw new Error(response.message || window.I18nManager.t('loginFailed') || 'Login failed');
            }
        } catch (error) {
            window.DEBUG_UTILS.error('auth', 'Login failed:', error);
            throw new Error(error.message || window.I18nManager.t('networkError') || 'Network error');
        }
    },
    
    // 用户注册
    register: async function(email, password) {
        try {
            window.DEBUG_UTILS.log('auth', 'Attempting registration for:', email);
            
            const response = await window.APIUtils.post(window.API_ENDPOINTS.AUTH.REGISTER, {
                email: email,
                password: password
            });
            
            // 根据实际API响应结构判断成功（注册成功可能返回不同的结构）
            if (response && (response.success !== false)) {
                window.DEBUG_UTILS.log('auth', 'Registration successful');
                return response;
            } else {
                throw new Error(response.message || window.I18nManager.t('registerFailed') || 'Registration failed');
            }
        } catch (error) {
            window.DEBUG_UTILS.error('auth', 'Registration failed:', error);
            throw new Error(error.message || window.I18nManager.t('networkError') || 'Network error');
        }
    },
    
    // 用户退出
    logout: async function() {
        try {
            window.DEBUG_UTILS.log('auth', '=== LOGOUT PROCESS STARTED ===');
            
            // 如果有token，调用退出API
            const token = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
            if (token) {
                await window.APIUtils.post(window.API_ENDPOINTS.AUTH.LOGOUT);
            }
        } catch (error) {
            window.DEBUG_UTILS.warn('auth', 'Logout API call failed:', error);
        } finally {
            // 无论API调用是否成功，都清除本地数据
            this.clearUserData();
            
            window.DEBUG_UTILS.log('auth', 'About to emit USER_LOGOUT event');
            // 触发退出事件
            window.EventUtils.emit(window.APP_EVENTS.USER_LOGOUT);
            window.DEBUG_UTILS.log('auth', 'USER_LOGOUT event emitted');
            
            // 显示成功消息
            window.MessageComponent.success(window.I18nManager.t('logoutSuccess') || 'Logout successful!');
            
            // 导航到首页
            if (window.NavigationModule) {
                window.NavigationModule.navigateTo('home');
            }
            
            window.DEBUG_UTILS.log('auth', '=== LOGOUT PROCESS COMPLETED ===');
        }
    },
    
    // 清除用户数据
    clearUserData: function() {
        this.currentUser = null;
        window.APP_STATE.user = null;
        
        // 清除本地存储
        window.StorageUtils.remove(window.APP_CONFIG.STORAGE_KEYS.USER);
        window.StorageUtils.remove(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
        
        // 购物车数据由 CartModule 的 handleUserLogout 方法处理
        // 不在这里直接操作购物车，保持模块责任分离
    },
    
    // 获取当前用户
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    // 检查是否已登录
    isLoggedIn: function() {
        return !!this.currentUser;
    },
    
    // 获取用户角色
    getUserRole: function() {
        return this.currentUser ? this.currentUser.role : null;
    },
    
    // 检查用户权限
    hasPermission: function(permission) {
        if (!this.currentUser) return false;
        
        const userPermissions = this.currentUser.permissions || [];
        return userPermissions.includes(permission);
    },
    
    // 更新用户资料
    updateProfile: async function(profileData) {
        try {
            if (!this.isLoggedIn()) {
                throw new Error(window.I18nManager.t('unauthorized') || 'Unauthorized');
            }
            
            const response = await window.APIUtils.put(window.API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
            
            if (response.success) {
                // 更新本地用户信息
                this.currentUser = { ...this.currentUser, ...response.user };
                window.APP_STATE.user = this.currentUser;
                
                // 更新本地存储
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.USER, this.currentUser);
                
                // 触发用户更新事件
                window.EventUtils.emit(window.APP_EVENTS.USER_UPDATED, this.currentUser);
                
                window.MessageComponent.success(window.I18nManager.t('profileUpdated') || 'Profile updated successfully!');
                window.DEBUG_UTILS.log('auth', 'Profile updated:', this.currentUser);
                
                return this.currentUser;
            } else {
                throw new Error(response.message || window.I18nManager.t('updateFailed') || 'Update failed');
            }
        } catch (error) {
            window.DEBUG_UTILS.error('auth', 'Profile update failed:', error);
            throw error;
        }
    },
    
    // 刷新token
    refreshToken: async function() {
        try {
            const response = await window.APIUtils.post(window.API_ENDPOINTS.AUTH.REFRESH);
            
            if (response.success) {
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.TOKEN, response.token);
                window.DEBUG_UTILS.log('auth', 'Token refreshed');
                return response.token;
            } else {
                // Token刷新失败，需要重新登录
                this.logout();
                throw new Error(window.I18nManager.t('sessionExpired') || 'Session expired');
            }
        } catch (error) {
            window.DEBUG_UTILS.error('auth', 'Token refresh failed:', error);
            this.logout();
            throw error;
        }
    },
    
    // 更新UI状态
    updateUI: function() {
        const loginButton = window.DOMUtils.get('#login-button');
        const userProfile = window.DOMUtils.get('#user-profile');
        const userEmail = window.DOMUtils.get('#user-email');
        
        if (this.isLoggedIn()) {
            // 已登录状态
            if (loginButton) window.DOMUtils.hide(loginButton);
            if (userProfile) window.DOMUtils.show(userProfile);
            if (userEmail) userEmail.textContent = this.currentUser.email;
        } else {
            // 未登录状态
            if (loginButton) window.DOMUtils.show(loginButton);
            if (userProfile) window.DOMUtils.hide(userProfile);
            if (userEmail) userEmail.textContent = '';
        }
    },
    
    // 确保认证有效性（用于敏感操作前）
    ensureAuthenticated: async function() {
        if (!this.isLoggedIn()) {
            return false;
        }
        
        // 对于敏感操作，总是验证token有效性
        return await this.validateToken();
    },
    
    // 验证token有效性（仅在需要时调用）
    validateToken: async function() {
        const token = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
        if (!token) {
            return false;
        }
        
        try {
            const response = await window.APIUtils.get(window.API_ENDPOINTS.AUTH.PROFILE);
            
            if (response.success) {
                // 更新用户信息（可能有更新）
                this.currentUser = response.user;
                window.APP_STATE.user = response.user;
                window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.USER, response.user);
                this.updateUI();
                window.DEBUG_UTILS.log('auth', 'Token validation successful');
                return true;
            } else {
                window.DEBUG_UTILS.log('auth', 'Token validation failed - invalid response');
                this.clearUserData();
                return false;
            }
        } catch (error) {
            if (error.message && error.message.includes('401')) {
                window.DEBUG_UTILS.log('auth', 'Token validation failed - token expired or invalid');
            } else {
                window.DEBUG_UTILS.warn('auth', 'Token validation failed:', error);
            }
            this.clearUserData();
            return false;
        }
    },
    
    // 检查认证状态
    // 检查认证状态
    checkAuthStatus: async function() {
        const token = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
        const savedUser = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.USER);
        
        // 如果没有token，直接清理状态
        if (!token) {
            this.clearUserData();
            return false;
        }
        
        // 如果有本地用户数据且当前用户状态一致，认为状态有效
        if (savedUser && this.currentUser && this.currentUser.id === savedUser.id) {
            window.DEBUG_UTILS.log('auth', 'Auth status: valid (using cached data)');
            this.updateUI();
            return true;
        }
        
        // 如果有本地用户数据但没有当前用户，先恢复本地状态
        if (savedUser && !this.currentUser) {
            this.currentUser = savedUser;
            window.APP_STATE.user = savedUser;
            this.updateUI();
            window.DEBUG_UTILS.log('auth', 'Auth status: restored from localStorage');
            return true;
        }
        
        // 其他情况下，需要通过API验证token有效性
        window.DEBUG_UTILS.log('auth', 'Validating token via API...');
        return await this.validateToken();
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.AuthModule.init();
});

window.DEBUG_UTILS.log('auth', 'Auth module loaded');