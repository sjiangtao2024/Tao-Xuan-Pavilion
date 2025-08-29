/**
 * 导航模块
 * 处理页面切换和路由管理
 */

window.NavigationModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前页面
    currentPage: 'home',
    
    // 页面历史
    pageHistory: [],
    
    // 初始化
    init: function() {
        this.currentPage = window.APP_STATE.currentPage || 'home';
        this.bindEvents();
        this.initializeRouting();
        this.isInitialized = true;
        window.DEBUG_UTILS.success('navigation', '导航模块初始化成功');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 导航链接点击事件 - 处理data-page属性
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            }
        });
        
        // 浏览器前进后退
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.navigateTo(page, false); // false表示不推送到历史记录
        });
        
        // 监听页面变化事件
        window.EventUtils.on(window.APP_EVENTS.PAGE_CHANGED, (event) => {
            this.updateNavigation();
        });
        
        // 监听语言变化事件
        window.EventUtils.on(window.APP_EVENTS.LANGUAGE_CHANGED, (event) => {
            this.handleLanguageChange(event.detail);
        });
    },
    
    // 初始化路由
    initializeRouting: function() {
        // 从URL获取初始页面
        const urlPage = this.getPageFromUrl();
        if (urlPage && urlPage !== this.currentPage) {
            this.navigateTo(urlPage, false);
        } else {
            // 如果是根路径且没有哈希，直接显示主页而不更新URL
            if (!window.location.hash && window.location.pathname === '/') {
                this.showPage(this.currentPage);
            } else {
                this.navigateTo(this.currentPage, false);
            }
        }
    },
    
    // 从URL获取页面
    getPageFromUrl: function() {
        const hash = window.location.hash.substring(1); // 去掉 # 号
        const params = window.URLUtils.getParams();
        
        window.DEBUG_UTILS.log('navigation', 'NavigationModule.getPageFromUrl 被调用');
        window.DEBUG_UTILS.log('navigation', '  - hash:', hash);
        window.DEBUG_UTILS.log('navigation', '  - params:', params);
        
        // 支持多种 URL 格式
        if (hash) {
            // 检查是否是产品页面，并提取产品ID
            if (hash.startsWith('product')) {
                window.DEBUG_UTILS.log('navigation', '检测到产品页面hash:', hash);
                // 提取产品ID并设置到APP_STATE
                const productIdMatch = hash.match(/[?&]id=([^&]+)/);
                if (productIdMatch) {
                    const productId = parseInt(productIdMatch[1]);
                    window.DEBUG_UTILS.success('navigation', '从 URL 提取到产品ID:', productId);
                    window.APP_STATE.currentProductId = productId;
                    window.DEBUG_UTILS.log('navigation', '从 URL 恢复产品ID:', productId);
                } else {
                    window.DEBUG_UTILS.warn('navigation', 'hash中没有找到产品ID参数');
                }
                return 'product';
            }
            
            // 检查是否是纯数字hash（可能是产品ID）
            if (/^[0-9]+$/.test(hash)) {
                window.DEBUG_UTILS.log('navigation', '检测到数字hash，可能是产品ID:', hash);
                const productId = parseInt(hash);
                window.APP_STATE.currentProductId = productId;
                window.DEBUG_UTILS.log('navigation', '将数字hash作为产品ID:', productId);
                return 'product';
            }
            
            return hash;
        }
        
        // 检查URL查询参数
        if (params.page) {
            if (params.page === 'product' && params.id) {
                const productId = parseInt(params.id);
                window.DEBUG_UTILS.success('navigation', '从查询参数获取产品ID:', productId);
                window.APP_STATE.currentProductId = productId;
                window.DEBUG_UTILS.log('navigation', '从查询参数恢复产品ID:', productId);
            }
            return params.page;
        }
        
        // 检查是否有单独的产品ID参数
        if (params.id) {
            const productId = parseInt(params.id);
            window.DEBUG_UTILS.success('navigation', '检测到单独的产品ID参数:', productId);
            window.APP_STATE.currentProductId = productId;
            window.DEBUG_UTILS.log('navigation', '从单独参数恢复产品ID:', productId);
            return 'product';
        }
        
        window.DEBUG_UTILS.log('navigation', '未找到任何页面信息');
        return null;
    },
    
    // 导航到指定页面
    navigateTo: function(page, pushState = true) {
        if (!page || page === this.currentPage) {
            return;
        }
        
        // 验证页面是否存在
        if (!this.pageExists(page)) {
            window.DEBUG_UTILS.warn('navigation', 'Page does not exist:', page);
            return;
        }
        
        // 记录页面历史
        if (pushState) {
            this.pageHistory.push(this.currentPage);
            
            // 更新URL
            this.updateUrl(page);
        }
        
        // 隐藏当前页面
        this.hidePage(this.currentPage);
        
        // 更新状态
        const previousPage = this.currentPage;
        this.currentPage = page;
        window.APP_STATE.currentPage = page;
        
        // 显示新页面
        this.showPage(page);
        
        // 触发页面变化事件
        window.EventUtils.emit(window.APP_EVENTS.PAGE_CHANGED, page);
        
        window.DEBUG_UTILS.log('navigation', `Navigated from ${previousPage} to ${page}`);
    },
    
    // 检查页面是否存在
    pageExists: function(page) {
        const pageElement = window.DOMUtils.get(`#${page}-page`);
        return !!pageElement;
    },
    
    // 显示页面
    showPage: function(page) {
        const pageElement = window.DOMUtils.get(`#${page}-page`);
        if (pageElement) {
            window.DOMUtils.show(pageElement);
            
            // 页面特殊处理
            this.handlePageShow(page);
        }
    },
    
    // 隐藏页面
    hidePage: function(page) {
        const pageElement = window.DOMUtils.get(`#${page}-page`);
        if (pageElement) {
            window.DOMUtils.hide(pageElement);
            
            // 页面特殊处理
            this.handlePageHide(page);
        }
    },
    
    // 处理页面显示 - 修改为调用shop模块的函数
    handlePageShow: function(page) {
        switch (page) {
            case 'home':
                // 调用shop模块加载产品并渲染首页
                if (window.ShopModule) {
                    window.ShopModule.loadProducts();
                }
                break;
            case 'shop':
                // 调用shop模块渲染商店页面
                if (window.ShopModule) {
                    if (window.ShopModule.allProducts.length === 0) {
                        window.ShopModule.loadProducts();
                    } else {
                        window.ShopModule.renderShopPage();
                    }
                }
                break;
            case 'product':
                // 产品详情页面显示时的特殊处理
                if (window.ProductModule) {
                    window.ProductModule.loadProductPage();
                }
                break;
            case 'profile':
                // 用户资料页面显示时的特殊处理
                if (window.ProfileModule) {
                    window.ProfileModule.loadProfilePage();
                }
                break;
            case 'about':
                this.renderAboutPage();
                break;
            case 'contact':
                this.renderContactPage();
                break;
        }
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // 处理页面隐藏
    handlePageHide: function(page) {
        switch (page) {
            case 'product':
                // 清理产品详情页面资源
                if (window.ProductModule) {
                    window.ProductModule.cleanup();
                }
                break;
        }
    },
    
    // 渲染关于我们页面 - 完全匹配原始frontend.html的renderAboutPage函数
    renderAboutPage: function() {
        const aboutPage = document.getElementById('about-page');
        if (!aboutPage) return;
        
        aboutPage.innerHTML = `
            <section class="py-20 px-6">
                <div class="container mx-auto max-w-4xl">
                    <h1 class="text-4xl font-serif-sc font-bold text-center mb-12 text-gold">${window.I18nManager.getCurrentTranslations().aboutTitle}</h1>
                    
                    <div class="space-y-12">
                        <div class="text-center">
                            <div class="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center border-4 border-gold shadow-lg">
                                <svg class="w-24 h-24" viewBox="0 0 100 100">
                                    <!-- 阴阳鱼太极图 -->
                                    <circle cx="50" cy="50" r="46" fill="#fff" stroke="#A88F5A" stroke-width="4"/>
                                    <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4 Z" fill="#000"/>
                                    <circle cx="50" cy="27" r="7" fill="#000"/>
                                    <circle cx="50" cy="73" r="7" fill="#fff"/>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold text-gold mb-4">${window.I18nManager.getCurrentTranslations().aboutMission}</h2>
                            <p class="text-gray-300 leading-relaxed">${window.I18nManager.getCurrentTranslations().aboutMissionText}</p>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-8">
                            <div class="bg-black bg-opacity-40 p-6 rounded-lg border border-gold/20">
                                <div class="w-16 h-16 mb-4 bg-gold rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <!-- 简化的工匠工具图标 -->
                                        <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                        <circle cx="8" cy="8" r="2" fill="currentColor"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-gold mb-3">${window.I18nManager.getCurrentTranslations().aboutCraftsmanship || 'Master Craftsmanship'}</h3>
                                <p class="text-gray-300">${window.I18nManager.getCurrentTranslations().aboutCraftsmanshipText || 'Our artifacts are created by master craftsmen who have inherited centuries-old techniques.'}</p>
                            </div>
                            
                            <div class="bg-black bg-opacity-40 p-6 rounded-lg border border-gold/20">
                                <div class="w-16 h-16 mb-4 bg-gold rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <!-- 简化的心形宝石图标 -->
                                        <path stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-gold mb-3">${window.I18nManager.getCurrentTranslations().aboutValues}</h3>
                                <p class="text-gray-300">${window.I18nManager.getCurrentTranslations().aboutValuesText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    // 渲染联系我们页面 - 完全匹配原始frontend.html的renderContactPage函数
    renderContactPage: function() {
        const contactPage = document.getElementById('contact-page');
        if (!contactPage) return;
        
        contactPage.innerHTML = `
            <section class="py-20 px-6">
                <div class="container mx-auto max-w-4xl">
                    <h1 class="text-4xl font-serif-sc font-bold text-center mb-12 text-gold">${window.I18nManager.getCurrentTranslations().contactTitle}</h1>
                    
                    <div class="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 class="text-2xl font-bold text-gold mb-6">${window.I18nManager.getCurrentTranslations().contactInfo}</h2>
                            <div class="space-y-4">
                                <div class="flex items-center space-x-3">
                                    <svg class="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                    <span class="text-gray-300">${window.I18nManager.getCurrentTranslations().contactEmail}</span>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <svg class="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                    </svg>
                                    <span class="text-gray-300">${window.I18nManager.getCurrentTranslations().contactPhone}</span>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <svg class="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    </svg>
                                    <span class="text-gray-300">${window.I18nManager.getCurrentTranslations().contactHours}</span>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <svg class="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span class="text-gray-300">${window.I18nManager.getCurrentTranslations().contactAddress}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 class="text-2xl font-bold text-gold mb-6">${window.I18nManager.getCurrentTranslations().contactForm || 'Contact Form'}</h2>
                            <form class="space-y-4" onsubmit="handleContactForm(event)">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">${window.I18nManager.getCurrentTranslations().contactName || 'Name'}</label>
                                    <input type="text" required class="w-full px-4 py-2 bg-black bg-opacity-40 border border-gold/30 rounded-lg text-white focus:border-gold focus:outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">${window.I18nManager.getCurrentTranslations().contactEmailField || 'Email'}</label>
                                    <input type="email" required class="w-full px-4 py-2 bg-black bg-opacity-40 border border-gold/30 rounded-lg text-white focus:border-gold focus:outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">${window.I18nManager.getCurrentTranslations().contactMessage || 'Message'}</label>
                                    <textarea required rows="4" class="w-full px-4 py-2 bg-black bg-opacity-40 border border-gold/30 rounded-lg text-white focus:border-gold focus:outline-none resize-none"></textarea>
                                </div>
                                <button type="submit" class="w-full btn-primary py-3 rounded-lg text-lg font-semibold">
                                    ${window.I18nManager.getCurrentTranslations().contactSend || 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    // 处理联系表单提交
    handleContactFormSubmit: function() {
        // 这里应该实现发送消息的逻辑
        window.MessageComponent.success(window.t('messageSent', 'Message sent successfully! We will get back to you soon.'));
        
        // 重置表单
        const contactForm = window.DOMUtils.get('#contact-form');
        if (contactForm) {
            contactForm.reset();
        }
    },
    
    // 更新URL
    updateUrl: function(page) {
        const url = new URL(window.location);
        
        // 如果是主页，不设置哈希，保持URL简洁
        if (page === 'home') {
            url.hash = '';
        } else {
            url.hash = page;
        }
        
        window.history.pushState({ page: page }, '', url);
    },
    
    // 更新导航状态
    updateNavigation: function() {
        // 更新导航链接的激活状态 - 支持两种方式
        const navLinks = window.DOMUtils.getAll('.nav-link');
        navLinks.forEach(link => {
            // 检查data-page属性
            const dataPage = link.getAttribute('data-page');
            // 检查onclick属性中的页面名
            const onclick = link.getAttribute('onclick');
            let onclickPage = null;
            if (onclick) {
                const match = onclick.match(/showPage\(['"](\w+)['"]\)/);
                if (match) {
                    onclickPage = match[1];
                }
            }
            
            // 检查任意一种方式是否匹配当前页面
            if (dataPage === this.currentPage || onclickPage === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    // 返回上一页
    goBack: function() {
        if (this.pageHistory.length > 0) {
            const previousPage = this.pageHistory.pop();
            this.navigateTo(previousPage, false);
        } else {
            this.navigateTo('home');
        }
    },
    
    // 获取当前页面
    getCurrentPage: function() {
        return this.currentPage;
    },
    
    // 处理语言变化
    handleLanguageChange: function(newLanguage) {
        window.DEBUG_UTILS.log('navigation', '处理语言变化:', newLanguage);
            
        // 重新渲染当前页面以更新语言内容
        this.handlePageShow(this.currentPage);
    },
    
    // 刷新当前页面
    refresh: function() {
        this.handlePageShow(this.currentPage);
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.NavigationModule.init();
});

window.DEBUG_UTILS.log('navigation', 'Navigation module loaded');