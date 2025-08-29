/**
 * 模态框组件
 * 管理各种模态框的显示和交互
 */

window.ModalComponent = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前打开的模态框
    currentModal: null,
    
    // 初始化
    init: function() {
        this.bindEvents();
        this.createModals();
        this.isInitialized = true;
        window.DEBUG_UTILS.log('modal', 'Modal component initialized');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 点击遮罩层关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close();
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
        
        // 监听模态框事件
        window.EventUtils.on(window.APP_EVENTS.MODAL_OPENED, (event) => {
            document.body.style.overflow = 'hidden';
        });
        
        window.EventUtils.on(window.APP_EVENTS.MODAL_CLOSED, (event) => {
            document.body.style.overflow = '';
        });
    },
    
    // 创建模态框结构
    createModals: function() {
        this.createLoginModal();
        this.createRegisterModal();
        this.createCartModal();
    },
    
    // 创建登录模态框
    createLoginModal: function() {
        const modal = window.DOMUtils.get('#login-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" data-lang-key="login">Login</h2>
                    <button type="button" class="modal-close" onclick="ModalComponent.close()">&times;</button>
                </div>
                <div id="google-oauth-section" class="form-group">
                    <div id="google-signin-container" class="text-center mb-4"></div>
                    <div class="text-center mb-4">
                        <span class="text-sm text-gray-500" data-lang-key="orLoginWith">Or login with email</span>
                    </div>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email" class="form-label" data-lang-key="email">Email</label>
                        <input type="email" id="login-email" class="form-input" required placeholder="Enter your email">
                        <div class="form-error" id="login-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="login-password" class="form-label" data-lang-key="password">Password</label>
                        <input type="password" id="login-password" class="form-input" required placeholder="Enter your password">
                        <div class="form-error" id="login-password-error"></div>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn-primary w-full py-2 rounded-md" data-lang-key="login">Login</button>
                    </div>
                    <div class="form-group text-center">
                        <p class="text-sm">
                            <span data-lang-key="noAccount">Don't have an account?</span>
                            <a href="#" class="text-primary hover:underline ml-1" onclick="ModalComponent.switchToRegister()" data-lang-key="register">Register</a>
                        </p>
                        <p class="text-sm mt-2">
                            <a href="#" class="text-primary hover:underline" data-lang-key="forgotPassword">Forgot Password?</a>
                        </p>
                    </div>
                </form>
            </div>
        `;
        
        // 绑定登录表单提交事件
        const loginForm = window.DOMUtils.get('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginSubmit();
            });
        }
        
        // 设置Google OAuth按钮
        this.setupGoogleOAuth();
    },
    
    // 创建注册模态框
    createRegisterModal: function() {
        const modal = window.DOMUtils.get('#register-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" data-lang-key="register">Register</h2>
                    <button type="button" class="modal-close" onclick="ModalComponent.close()">&times;</button>
                </div>
                <form id="register-form">
                    <div class="form-group">
                        <label for="register-email" class="form-label" data-lang-key="email">Email</label>
                        <input type="email" id="register-email" class="form-input" required>
                        <div class="form-error" id="register-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="register-password" class="form-label" data-lang-key="password">Password</label>
                        <input type="password" id="register-password" class="form-input" required>
                        <div class="form-error" id="register-password-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="register-confirm-password" class="form-label" data-lang-key="confirmPassword">Confirm Password</label>
                        <input type="password" id="register-confirm-password" class="form-input" required>
                        <div class="form-error" id="register-confirm-password-error"></div>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn-primary w-full py-2 rounded-md" data-lang-key="register">Register</button>
                    </div>
                    <div class="form-group text-center">
                        <p class="text-sm">
                            <span data-lang-key="haveAccount">Already have an account?</span>
                            <a href="#" class="text-primary hover:underline ml-1" onclick="ModalComponent.switchToLogin()" data-lang-key="login">Login</a>
                        </p>
                    </div>
                </form>
            </div>
        `;
        
        // 绑定注册表单提交事件
        const registerForm = window.DOMUtils.get('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterSubmit();
            });
        }
    },
    
    // 创建购物车模态框
    createCartModal: function() {
        const modal = window.DOMUtils.get('#cart-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title" data-lang-key="cart">Shopping Cart</h2>
                    <button type="button" class="modal-close" onclick="ModalComponent.close()">&times;</button>
                </div>
                <div id="cart-content">
                    <div id="cart-items"></div>
                    <div id="cart-summary" class="hidden">
                        <div class="border-t pt-4 mt-4">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-lg font-semibold" data-lang-key="totalPrice">Total Price:</span>
                                <span id="cart-total" class="text-xl font-bold text-primary">¥0.00</span>
                            </div>
                            <div class="flex gap-2">
                                <button id="clear-cart-btn" class="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600" data-lang-key="clearCart">Clear Cart</button>
                                <button id="checkout-btn" class="flex-1 py-2 px-4 btn-primary rounded" data-lang-key="checkout">Checkout</button>
                            </div>
                        </div>
                    </div>
                    <div id="cart-empty" class="text-center py-8">
                        <p class="text-gray-500" data-lang-key="cartEmpty">Your cart is empty</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 打开模态框
    open: function(modalId) {
        const modal = window.DOMUtils.get(`#${modalId}`);
        if (!modal) {
            window.DEBUG_UTILS.warn('modal', 'Modal not found:', modalId);
            return;
        }
        
        // 关闭当前模态框
        this.close();
        
        // 打开新模态框
        window.DOMUtils.show(modal);
        this.currentModal = modalId;
        
        // 清空表单内容
        this.clearFormData(modalId);
        
        // 更新翻译
        window.I18nManager.updateAllTexts();
        
        // 如果是登录模态框，尝试渲染Google OAuth按钮
        if (modalId === 'login-modal') {
            this.setupGoogleOAuth();
        }
        
        // 触发事件
        window.EventUtils.emit(window.APP_EVENTS.MODAL_OPENED, modalId);
        
        window.DEBUG_UTILS.log('modal', 'Modal opened:', modalId);
    },
    
    // 设置Google OAuth
    setupGoogleOAuth: function() {
        const googleSection = window.DOMUtils.get('#google-oauth-section');
        const googleContainer = window.DOMUtils.get('#google-signin-container');
        
        window.DEBUG_UTILS.log('modal', 'Setting up Google OAuth...');
        
        // 检查是否启用Google OAuth
        if (window.APP_CONFIG && window.APP_CONFIG.GOOGLE_OAUTH && window.APP_CONFIG.GOOGLE_OAUTH.ENABLED) {
            if (window.GoogleOAuth && window.GoogleOAuth.isInitialized) {
                // Google OAuth已初始化，显示按钮
                if (googleSection) {
                    googleSection.style.display = 'block';
                }
                
                if (googleContainer) {
                    // 清空容器
                    googleContainer.innerHTML = '';
                    
                    // 渲染Google登录按钮
                    setTimeout(() => {
                        window.GoogleOAuth.renderSignInButton('google-signin-container', {
                            theme: 'outline',
                            size: 'large',
                            text: 'signin_with',
                            width: '300'
                        });
                        window.DEBUG_UTILS.log('modal', 'Google OAuth button rendered successfully');
                    }, 100);
                }
            } else if (window.GoogleOAuth) {
                // Google OAuth未初始化，监听初始化完成事件
                window.DEBUG_UTILS.log('modal', 'Waiting for Google OAuth initialization...');
                
                // 移除之前可能存在的监听器
                window.EventUtils.off('google-oauth-ready', this._googleOAuthReadyHandler);
                
                // 创建新的事件处理器
                this._googleOAuthReadyHandler = () => {
                    window.DEBUG_UTILS.log('modal', 'Google OAuth ready event received');
                    if (window.DOMUtils.get('#google-signin-container')) {
                        this.setupGoogleOAuth();
                    }
                };
                
                window.EventUtils.on('google-oauth-ready', this._googleOAuthReadyHandler);
                
                // 如果GoogleOAuth模块存在但未初始化，尝试初始化
                if (window.GoogleOAuth && !window.GoogleOAuth.isInitialized) {
                    window.DEBUG_UTILS.log('modal', 'Attempting to initialize Google OAuth...');
                    window.GoogleOAuth.init();
                }
                
                // 临时隐藏Google OAuth部分，等待初始化完成
                if (googleSection) {
                    googleSection.style.display = 'none';
                }
            } else {
                window.DEBUG_UTILS.warn('modal', 'GoogleOAuth module not loaded');
                // 隐藏Google OAuth部分
                if (googleSection) {
                    googleSection.style.display = 'none';
                }
            }
        } else {
            window.DEBUG_UTILS.log('modal', 'Google OAuth not enabled in configuration');
            // 隐藏Google OAuth部分
            if (googleSection) {
                googleSection.style.display = 'none';
            }
        }
    },
    
    // 关闭模态框
    close: function() {
        if (this.currentModal) {
            const modal = window.DOMUtils.get(`#${this.currentModal}`);
            if (modal) {
                window.DOMUtils.hide(modal);
            }
            
            // 清除表单错误
            this.clearFormErrors();
            
            // 触发事件
            window.EventUtils.emit(window.APP_EVENTS.MODAL_CLOSED, this.currentModal);
            
            window.DEBUG_UTILS.log('modal', 'Modal closed:', this.currentModal);
            this.currentModal = null;
        }
    },
    
    // 切换到登录模态框
    switchToLogin: function() {
        this.open('login-modal');
    },
    
    // 切换到注册模态框
    switchToRegister: function() {
        this.open('register-modal');
    },
    
    // 处理登录表单提交
    handleLoginSubmit: async function() {
        const email = window.DOMUtils.get('#login-email').value.trim();
        const password = window.DOMUtils.get('#login-password').value;
        
        // 清除之前的错误
        this.clearFormErrors('login');
        
        // 验证表单
        const errors = this.validateLoginForm(email, password);
        if (Object.keys(errors).length > 0) {
            this.showFormErrors('login', errors);
            return;
        }
        
        try {
            // 调用认证模块的登录方法
            if (window.AuthModule) {
                await window.AuthModule.login(email, password);
                this.close();
            }
        } catch (error) {
            window.DEBUG_UTILS.error('modal', 'Login failed:', error);
            // 显示具体的错误消息
            const errorMessage = error.message || window.I18nManager.t('loginFailed') || 'Login failed';
            window.MessageComponent.error(errorMessage);
        }
    },
    
    // 处理注册表单提交
    handleRegisterSubmit: async function() {
        const email = window.DOMUtils.get('#register-email').value.trim();
        const password = window.DOMUtils.get('#register-password').value;
        const confirmPassword = window.DOMUtils.get('#register-confirm-password').value;
        
        // 清除之前的错误
        this.clearFormErrors('register');
        
        // 验证表单
        const errors = this.validateRegisterForm(email, password, confirmPassword);
        if (Object.keys(errors).length > 0) {
            this.showFormErrors('register', errors);
            return;
        }
        
        try {
            // 调用认证模块的注册方法
            if (window.AuthModule) {
                const result = await window.AuthModule.register(email, password);
                
                // 关闭注册模态框
                this.close();
                
                // 检查是否自动登录
                if (result.autoLogin) {
                    // 已自动登录，显示明确的自动登录消息
                    const autoLoginMessage = window.I18nManager.t('registerAndLoginSuccess') || '注册成功！您已自动登录，欢迎加入道玄阁！';
                    window.MessageComponent.success(autoLoginMessage);
                    window.DEBUG_UTILS.log('modal', 'Registration successful with auto-login');
                } else {
                    // 需要手动登录，打开登录模态框并显示消息
                    window.MessageComponent.success(result.message || window.I18nManager.t('registerSuccess') || 'Registration successful! Please login.');
                    
                    // 稍微延迟打开登录模态框，让用户看到成功消息
                    setTimeout(() => {
                        this.open('login-modal');
                        // 在登录表单中预填邮箱
                        const loginEmailInput = window.DOMUtils.get('#login-email');
                        if (loginEmailInput) {
                            loginEmailInput.value = email;
                        }
                    }, 1500);
                    
                    window.DEBUG_UTILS.log('modal', 'Registration successful - login required');
                }
            }
        } catch (error) {
            window.DEBUG_UTILS.error('modal', 'Registration failed:', error);
            // 显示具体的错误消息
            const errorMessage = error.message || window.I18nManager.t('registerFailed') || 'Registration failed';
            window.MessageComponent.error(errorMessage);
        }
    },
    
    // 验证登录表单
    validateLoginForm: function(email, password) {
        const errors = {};
        
        if (!email) {
            errors.email = window.I18nManager.t('emailRequired');
        } else if (!window.ValidationUtils.email(email)) {
            errors.email = window.I18nManager.t('emailInvalid');
        }
        
        if (!password) {
            errors.password = window.I18nManager.t('passwordRequired');
        } else if (!window.ValidationUtils.password(password)) {
            errors.password = window.I18nManager.t('passwordTooShort');
        }
        
        return errors;
    },
    
    // 验证注册表单
    validateRegisterForm: function(email, password, confirmPassword) {
        const errors = {};
        
        if (!email) {
            errors.email = window.I18nManager.t('emailRequired');
        } else if (!window.ValidationUtils.email(email)) {
            errors.email = window.I18nManager.t('emailInvalid');
        }
        
        if (!password) {
            errors.password = window.I18nManager.t('passwordRequired');
        } else if (!window.ValidationUtils.password(password)) {
            errors.password = window.I18nManager.t('passwordTooShort');
        }
        
        if (!confirmPassword) {
            errors.confirmPassword = window.I18nManager.t('passwordRequired');
        } else if (password !== confirmPassword) {
            errors.confirmPassword = window.I18nManager.t('passwordMismatch');
        }
        
        return errors;
    },
    
    // 显示表单错误
    showFormErrors: function(formType, errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = window.DOMUtils.get(`#${formType}-${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
            }
        });
    },
    
    // 清空表单数据
    clearFormData: function(modalId) {
        if (modalId === 'login-modal') {
            const emailInput = window.DOMUtils.get('#login-email');
            const passwordInput = window.DOMUtils.get('#login-password');
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
        } else if (modalId === 'register-modal') {
            const emailInput = window.DOMUtils.get('#register-email');
            const passwordInput = window.DOMUtils.get('#register-password');
            const confirmPasswordInput = window.DOMUtils.get('#register-confirm-password');
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
        }
            
        // 清空错误信息
        this.clearFormErrors();
    },
    
    // 清除表单错误
    clearFormErrors: function(formType = null) {
        const selector = formType ? `#${formType}-form .form-error` : '.form-error';
        const errorElements = window.DOMUtils.getAll(selector);
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.ModalComponent.init();
});

window.DEBUG_UTILS.log('modal', 'Modal component loaded');