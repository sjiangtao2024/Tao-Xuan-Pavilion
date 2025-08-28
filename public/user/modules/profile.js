/**
 * 用户资料模块
 * 处理用户个人信息和设置
 */

window.ProfileModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前用户信息
    currentUser: null,
    
    // 初始化
    init: function() {
        this.bindEvents();
        this.isInitialized = true;
        window.DEBUG_UTILS.log('profile', 'Profile module initialized');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 监听页面切换事件
        window.EventUtils.on(window.APP_EVENTS.PAGE_CHANGED, (event) => {
            if (event.detail === 'profile') {
                this.loadProfilePage();
            }
        });
        
        // 监听用户状态变化
        window.EventUtils.on(window.APP_EVENTS.USER_LOGIN, () => {
            this.currentUser = window.AuthModule.getCurrentUser();
        });
        
        window.EventUtils.on(window.APP_EVENTS.USER_LOGOUT, () => {
            this.currentUser = null;
        });
        
        window.EventUtils.on(window.APP_EVENTS.USER_UPDATED, (event) => {
            this.currentUser = event.detail;
        });
    },
    
    // 加载用户资料页面
    loadProfilePage: function() {
        // 检查登录状态
        if (!window.AuthModule.isLoggedIn()) {
            this.showLoginRequired();
            return;
        }
        
        this.currentUser = window.AuthModule.getCurrentUser();
        this.renderProfilePage();
    },
    
    // 渲染用户资料页面
    renderProfilePage: function() {
        const profilePage = window.DOMUtils.get('#profile-page');
        if (!profilePage) return;
        
        profilePage.innerHTML = `
            <div class="profile-container py-8">
                <div class="container max-w-4xl mx-auto">
                    <h1 class="text-3xl font-serif-sc font-bold text-center mb-8 text-gold" data-lang-key="profile">
                        User Profile
                    </h1>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- 侧边栏导航 -->
                        <div class="profile-sidebar">
                            <nav class="profile-nav bg-gray-800 rounded-lg p-6">
                                <ul class="space-y-2">
                                    <li>
                                        <button class="profile-nav-btn active w-full text-left p-3 rounded" 
                                                data-section="personal-info" data-lang-key="personalInfo">
                                            Personal Information
                                        </button>
                                    </li>
                                    <li>
                                        <button class="profile-nav-btn w-full text-left p-3 rounded" 
                                                data-section="order-history" data-lang-key="orderHistory">
                                            Order History
                                        </button>
                                    </li>
                                    <li>
                                        <button class="profile-nav-btn w-full text-left p-3 rounded" 
                                                data-section="favorites" data-lang-key="favorites">
                                            Favorites
                                        </button>
                                    </li>
                                    <li>
                                        <button class="profile-nav-btn w-full text-left p-3 rounded" 
                                                data-section="settings" data-lang-key="settings">
                                            Settings
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        
                        <!-- 主内容区 -->
                        <div class="profile-content lg:col-span-2">
                            <!-- 个人信息 -->
                            <div id="personal-info-section" class="profile-section">
                                ${this.renderPersonalInfoSection()}
                            </div>
                            
                            <!-- 订单历史 -->
                            <div id="order-history-section" class="profile-section hidden">
                                ${this.renderOrderHistorySection()}
                            </div>
                            
                            <!-- 收藏夹 -->
                            <div id="favorites-section" class="profile-section hidden">
                                ${this.renderFavoritesSection()}
                            </div>
                            
                            <!-- 设置 -->
                            <div id="settings-section" class="profile-section hidden">
                                ${this.renderSettingsSection()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定事件
        this.bindProfilePageEvents();
        
        // 更新翻译
        window.I18nManager.updateAllTexts();
        
        window.DEBUG_UTILS.log('profile', 'Profile page rendered');
    },
    
    // 渲染个人信息部分
    renderPersonalInfoSection: function() {
        return `
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-6 text-gold" data-lang-key="personalInfo">Personal Information</h2>
                
                <form id="profile-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="profile-email" class="form-label" data-lang-key="email">Email</label>
                            <input type="email" id="profile-email" class="form-input" 
                                   value="${this.currentUser?.email || ''}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-username" class="form-label" data-lang-key="username">Username</label>
                            <input type="text" id="profile-username" class="form-input" 
                                   value="${this.currentUser?.username || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-first-name" class="form-label" data-lang-key="firstName">First Name</label>
                            <input type="text" id="profile-first-name" class="form-input" 
                                   value="${this.currentUser?.firstName || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-last-name" class="form-label" data-lang-key="lastName">Last Name</label>
                            <input type="text" id="profile-last-name" class="form-input" 
                                   value="${this.currentUser?.lastName || ''}">
                        </div>
                        
                        <div class="form-group md:col-span-2">
                            <label for="profile-phone" class="form-label" data-lang-key="phone">Phone</label>
                            <input type="tel" id="profile-phone" class="form-input" 
                                   value="${this.currentUser?.phone || ''}">
                        </div>
                        
                        <div class="form-group md:col-span-2">
                            <label for="profile-address" class="form-label" data-lang-key="address">Address</label>
                            <textarea id="profile-address" class="form-input" rows="3">${this.currentUser?.address || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="mt-6 text-right">
                        <button type="submit" class="btn-primary px-6 py-2 rounded" data-lang-key="saveChanges">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
    },
    
    // 渲染订单历史部分
    renderOrderHistorySection: function() {
        return `
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-6 text-gold" data-lang-key="orderHistory">Order History</h2>
                
                <div id="orders-list">
                    <p class="text-center text-gray-400 py-8" data-lang-key="loadingOrders">Loading orders...</p>
                </div>
            </div>
        `;
    },
    
    // 渲染收藏夹部分
    renderFavoritesSection: function() {
        return `
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-6 text-gold" data-lang-key="favorites">Favorites</h2>
                
                <div id="favorites-list">
                    <p class="text-center text-gray-400 py-8" data-lang-key="loadingFavorites">Loading favorites...</p>
                </div>
            </div>
        `;
    },
    
    // 渲染设置部分
    renderSettingsSection: function() {
        return `
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-6 text-gold" data-lang-key="settings">Settings</h2>
                
                <div class="space-y-6">
                    <!-- 语言设置 -->
                    <div class="setting-item">
                        <h3 class="text-lg font-medium mb-2" data-lang-key="language">Language</h3>
                        <select id="language-setting" class="form-input">
                            <option value="en" ${window.I18nManager.getCurrentLanguage() === 'en' ? 'selected' : ''}>English</option>
                            <option value="zh" ${window.I18nManager.getCurrentLanguage() === 'zh' ? 'selected' : ''}>中文</option>
                        </select>
                    </div>
                    
                    <!-- 通知设置 -->
                    <div class="setting-item">
                        <h3 class="text-lg font-medium mb-2" data-lang-key="notifications">Notifications</h3>
                        <label class="flex items-center">
                            <input type="checkbox" id="email-notifications" class="mr-2" checked>
                            <span data-lang-key="emailNotifications">Email notifications</span>
                        </label>
                    </div>
                    
                    <!-- 隐私设置 -->
                    <div class="setting-item">
                        <h3 class="text-lg font-medium mb-2" data-lang-key="privacy">Privacy</h3>
                        <label class="flex items-center">
                            <input type="checkbox" id="profile-visibility" class="mr-2">
                            <span data-lang-key="publicProfile">Make profile public</span>
                        </label>
                    </div>
                    
                    <!-- 危险操作 -->
                    <div class="setting-item border-t border-red-600 pt-6 mt-8">
                        <h3 class="text-lg font-medium mb-2 text-red-400" data-lang-key="dangerZone">Danger Zone</h3>
                        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" 
                                onclick="ProfileModule.deleteAccount()" data-lang-key="deleteAccount">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 绑定用户资料页面事件
    bindProfilePageEvents: function() {
        // 导航按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('profile-nav-btn')) {
                const section = e.target.getAttribute('data-section');
                this.switchSection(section);
            }
        });
        
        // 个人信息表单提交
        const profileForm = window.DOMUtils.get('#profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
        
        // 语言设置变化
        const languageSetting = window.DOMUtils.get('#language-setting');
        if (languageSetting) {
            languageSetting.addEventListener('change', (e) => {
                window.I18nManager.setLanguage(e.target.value);
            });
        }
        
        // 加载订单历史
        setTimeout(() => this.loadOrderHistory(), 100);
        
        // 加载收藏夹
        setTimeout(() => this.loadFavorites(), 100);
    },
    
    // 切换部分
    switchSection: function(sectionName) {
        // 隐藏所有部分
        const sections = window.DOMUtils.getAll('.profile-section');
        sections.forEach(section => section.classList.add('hidden'));
        
        // 显示选中的部分
        const targetSection = window.DOMUtils.get(`#${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // 更新导航按钮状态
        const navButtons = window.DOMUtils.getAll('.profile-nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = window.DOMUtils.get(`[data-section="${sectionName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    },
    
    // 更新用户资料
    updateProfile: async function() {
        try {
            const profileData = {
                username: window.DOMUtils.get('#profile-username')?.value.trim(),
                firstName: window.DOMUtils.get('#profile-first-name')?.value.trim(),
                lastName: window.DOMUtils.get('#profile-last-name')?.value.trim(),
                phone: window.DOMUtils.get('#profile-phone')?.value.trim(),
                address: window.DOMUtils.get('#profile-address')?.value.trim()
            };
            
            await window.AuthModule.updateProfile(profileData);
            
        } catch (error) {
            window.MessageComponent.error(error.message);
        }
    },
    
    // 加载订单历史
    loadOrderHistory: async function() {
        const ordersList = window.DOMUtils.get('#orders-list');
        if (!ordersList) return;
        
        try {
            const response = await window.APIUtils.get(window.API_ENDPOINTS.USER.ORDERS);
            
            if (response.success && response.orders) {
                if (response.orders.length === 0) {
                    ordersList.innerHTML = '<p class="text-center text-gray-400 py-8" data-lang-key="noOrders">No orders found.</p>';
                } else {
                    ordersList.innerHTML = response.orders.map(order => this.renderOrderItem(order)).join('');
                }
            } else {
                throw new Error(response.message || 'Failed to load orders');
            }
            
        } catch (error) {
            window.DEBUG_UTILS.warn('profile', 'Failed to load orders:', error);
            ordersList.innerHTML = '<p class="text-center text-gray-400 py-8" data-lang-key="failedToLoadOrders">Failed to load orders.</p>';
        }
        
        // 更新翻译
        window.I18nManager.updateAllTexts();
    },
    
    // 渲染订单项目
    renderOrderItem: function(order) {
        return `
            <div class="order-item border border-gray-600 rounded p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-semibold">Order #${order.id}</h3>
                        <p class="text-sm text-gray-400">${window.FormatUtils.date(order.createdAt)}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold">${window.FormatUtils.price(order.totalAmount)}</p>
                        <span class="text-sm px-2 py-1 rounded ${this.getStatusClass(order.status)}">${order.status}</span>
                    </div>
                </div>
                <div class="text-sm text-gray-300">
                    ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </div>
            </div>
        `;
    },
    
    // 获取订单状态样式类
    getStatusClass: function(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-600 text-white';
            case 'pending':
                return 'bg-yellow-600 text-white';
            case 'cancelled':
                return 'bg-red-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    },
    
    // 加载收藏夹
    loadFavorites: async function() {
        const favoritesList = window.DOMUtils.get('#favorites-list');
        if (!favoritesList) return;
        
        try {
            const response = await window.APIUtils.get(window.API_ENDPOINTS.USER.FAVORITES);
            
            if (response.success && response.favorites) {
                if (response.favorites.length === 0) {
                    favoritesList.innerHTML = '<p class="text-center text-gray-400 py-8" data-lang-key="noFavorites">No favorites found.</p>';
                } else {
                    favoritesList.innerHTML = `
                        <div class="product-grid">
                            ${response.favorites.map(product => window.ShopModule.renderProductCard(product)).join('')}
                        </div>
                    `;
                }
            } else {
                throw new Error(response.message || 'Failed to load favorites');
            }
            
        } catch (error) {
            window.DEBUG_UTILS.warn('profile', 'Failed to load favorites:', error);
            favoritesList.innerHTML = '<p class="text-center text-gray-400 py-8" data-lang-key="failedToLoadFavorites">Failed to load favorites.</p>';
        }
        
        // 更新翻译
        window.I18nManager.updateAllTexts();
    },
    
    // 删除账户
    deleteAccount: function() {
        if (confirm(window.t('confirmDeleteAccount', 'Are you sure you want to delete your account? This action cannot be undone.'))) {
            // 这里应该实现删除账户的逻辑
            window.MessageComponent.info('Account deletion is not implemented yet.');
        }
    },
    
    // 显示需要登录
    showLoginRequired: function() {
        const profilePage = window.DOMUtils.get('#profile-page');
        if (!profilePage) return;
        
        profilePage.innerHTML = `
            <div class="login-required py-16 text-center">
                <div class="container">
                    <h1 class="text-4xl font-bold text-gold mb-4" data-lang-key="loginRequired">Login Required</h1>
                    <p class="text-gray-400 mb-8" data-lang-key="loginRequiredDesc">
                        Please login to access your profile.
                    </p>
                    <button class="btn-primary px-6 py-3 rounded-lg" onclick="ModalComponent.open('login-modal')" 
                            data-lang-key="login">
                        Login
                    </button>
                </div>
            </div>
        `;
        
        window.I18nManager.updateAllTexts();
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.ProfileModule.init();
});

window.DEBUG_UTILS.log('profile', 'Profile module loaded');