/**
 * 商店模块 - 完全匹配原始frontend.html的功能和布局
 * 处理产品展示、搜索、筛选等功能
 */

window.ShopModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 汇率缓存 - 完全匹配原始逻辑
    exchangeRate: null,
    exchangeRateLastUpdate: null,
    
    // 全局产品数据 - 匹配原始的allProducts变量
    allProducts: [],
    
    // 初始化
    init: function() {
        this.bindEvents();
        this.isInitialized = true;
        window.DEBUG_UTILS.success('shop', '商店模块初始化成功');
    },
    
    // 绑定事件 - 简化事件处理
    bindEvents: function() {
        // 监听语言变化事件
        window.EventUtils.on(window.APP_EVENTS.LANGUAGE_CHANGED, (event) => {
            this.handleLanguageChange(event.detail);
        });
        
        // 等待页面导航模块调用相应的渲染函数
        window.DEBUG_UTILS.log('shop', 'Shop module events bound');
    },
    
    // 获取单个产品 - 为ProductModule提供支持
    getProduct: function(productId) {
        // 从已加载的产品列表中查找
        const product = this.allProducts.find(p => p.id == productId);
        if (product) {
            window.DEBUG_UTILS.log('shop', `Found product in cache: ${product.name}`);
            return product;
        }
        
        window.DEBUG_UTILS.warn('shop', `Product ${productId} not found in cache`);
        return null;
    },
    
    // 加载产品数据 - 完全匹配原始frontend.html的loadProducts函数
    loadProducts: async function(categoryId = null, skipShopPageRender = false) {
        try {
            let url = `/api/products?lang=${window.I18nManager.getCurrentLanguage()}`;
            if (categoryId) {
                url += `&categoryId=${categoryId}`;
            }
            const products = await window.APIUtils.get(url);
            
            // 为每个产品预计算转换后的价格 - 完全匹配原始逻辑
            const rate = await this.getExchangeRate();
            for (const product of products) {
                product.originalPrice = product.price; // 保存原始美元价格
                if (window.I18nManager.getCurrentLanguage() === 'zh') {
                    product.displayPrice = (product.price * rate).toFixed(2);
                } else {
                    product.displayPrice = product.price.toFixed(2);
                }
            }
            
            this.allProducts = products;
            
            // 总是重新渲染首页 - 匹配原始逻辑
            this.renderHomePage();
            
            // 如果当前在shop页面且不跳过渲染，重新渲染shop页面 - 匹配原始逻辑
            const currentPage = this.getCurrentPage();
            if (currentPage === 'shop' && !skipShopPageRender) {
                setTimeout(() => {
                    this.renderShopPage();
                    // 在渲染后恢复分类选择
                    if (categoryId !== null) {
                        setTimeout(() => {
                            const categoryFilter = document.getElementById('category-filter');
                            if (categoryFilter) {
                                categoryFilter.value = categoryId;
                            }
                        }, 100);
                    }
                }, 50);
            } else if (currentPage === 'shop' && skipShopPageRender) {
                // 只更新产品网格，不重新渲染整个页面 - 匹配原始逻辑
                this.updateProductsGrid(this.allProducts);
            }
            
            window.DEBUG_UTILS.success('shop', `从 Cloudflare D1 数据库成功加载 ${products.length} 个产品`);
            
        } catch (error) {
            console.error('Failed to load products:', error);
            window.MessageComponent.error('Failed to load products');
        }
    },
    
    // 获取汇率 - 完全匹配原始frontend.html的getExchangeRate函数
    getExchangeRate: async function() {
        const now = new Date().getTime();
        const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
        
        // 检查缓存
        if (this.exchangeRate && this.exchangeRateLastUpdate && 
            (now - this.exchangeRateLastUpdate) < CACHE_DURATION) {
            return this.exchangeRate;
        }
        
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data && data.rates && data.rates.CNY) {
                this.exchangeRate = data.rates.CNY;
                this.exchangeRateLastUpdate = now;
                return this.exchangeRate;
            }
        } catch (error) {
            console.warn('Failed to fetch exchange rate, using fallback:', error);
        }
        
        // 备用汇率
        this.exchangeRate = 7.17;
        this.exchangeRateLastUpdate = now;
        return this.exchangeRate;
    },
    
    // 渲染首页 - 完全匹配原始frontend.html的renderHomePage函数
    renderHomePage: function() {
        const featuredProducts = this.allProducts.filter(p => p.featured).slice(0, 6);
        
        const homePageElement = document.getElementById('home-page');
        if (!homePageElement) return;
        
        homePageElement.innerHTML = `
            <section class="relative h-screen flex items-center justify-center text-center bg-gradient-to-b from-black via-gray-900 to-black">
                <div class="absolute inset-0 bg-black opacity-60"></div>
                <div class="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 class="text-6xl md:text-8xl font-serif-sc font-bold mb-6 text-gold tracking-wider">
                        ${window.I18nManager.getCurrentTranslations().siteName}
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                        Discover ancient artifacts imbued with mystical powers
                    </p>
                    <button onclick="showPage('shop')" class="btn-primary px-8 py-4 text-lg rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
                        Explore Artifacts
                    </button>
                </div>
            </section>

            <section class="py-20 px-6">
                <div class="container mx-auto">
                    <h2 class="text-4xl font-serif-sc font-bold text-center mb-12 text-gold">Featured Artifacts</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${featuredProducts.map(product => this.renderProductCard(product)).join('')}
                    </div>
                </div>
            </section>
        `;
        
        setTimeout(() => {
            document.querySelectorAll('.carousel').forEach(this.initCarousel);
        }, 100);
    },
    
    // 渲染商店页面 - 完全匹配原始frontend.html的renderShopPage函数
    renderShopPage: function() {
        // 确保有产品数据
        const productsToShow = this.allProducts || [];
        
        const shopPageElement = document.getElementById('shop-page');
        if (!shopPageElement) return;
        
        shopPageElement.innerHTML = `
            <section class="py-20 px-6">
                <div class="container mx-auto">
                    <h1 class="text-4xl font-serif-sc font-bold text-center mb-12 text-gold">${window.I18nManager.getCurrentTranslations().navShop}</h1>
                    
                    <div class="mb-8 flex flex-wrap gap-4 justify-center items-center">
                        <input type="text" id="search-input" placeholder="${window.I18nManager.getCurrentTranslations().search}" 
                               class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black" style="min-width: 250px;">
                        <select id="category-filter" class="px-4 py-2 rounded-lg border border-gray-300 bg-white text-black">
                            <option value="">${window.I18nManager.getCurrentTranslations().allCategories}</option>
                        </select>
                    </div>
                    
                    <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        ${productsToShow.length > 0 ? productsToShow.map(product => this.renderProductCard(product)).join('') : '<p class="text-gray-300 text-center col-span-full">正在加载产品...</p>'}
                    </div>
                </div>
            </section>
        `;
        
        this.populateCategoryFilter();
        
        // 添加分类过滤事件监听器 - 匹配原始逻辑
        setTimeout(() => {
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.addEventListener('change', async (e) => {
                    const categoryId = e.target.value;
                    // 使用平滑更新，避免重新渲染整个页面
                    await this.loadProducts(categoryId === '' ? null : categoryId, true);
                });
            }
            
            // 添加搜索功能事件监听器
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterProductsBySearch(e.target.value);
                });
            }
            
            document.querySelectorAll('.carousel').forEach(this.initCarousel);
        }, 100);
    },
    
    // 获取当前页面 - 完全匹配原始frontend.html的getCurrentPage函数
    getCurrentPage: function() {
        const pages = ['home', 'shop', 'about', 'contact', 'product'];
        for (const page of pages) {
            const element = document.getElementById(`${page}-page`);
            if (element && !element.classList.contains('hidden')) {
                return page;
            }
        }
        return 'home'; // 默认返回首页
    },
    
    // 更新产品网格 - 完全匹配原始frontend.html的updateProductsGrid函数
    updateProductsGrid: function(products) {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            // 添加渐隐效果
            productsGrid.style.opacity = '0.5';
            productsGrid.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                productsGrid.innerHTML = products.length > 0 
                    ? products.map(product => this.renderProductCard(product)).join('') 
                    : '<p class="text-gray-300 text-center col-span-full">暂无相关产品</p>';
                
                // 恢复透明度
                productsGrid.style.opacity = '1';
                
                // 重新初始化轮播图
                setTimeout(() => {
                    document.querySelectorAll('.carousel').forEach(this.initCarousel);
                }, 100);
            }, 150);
        }
    },
    
    // 根据搜索条件过滤产品 - 完全匹配原始frontend.html的filterProductsBySearch函数
    filterProductsBySearch: function(searchTerm) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        const filteredProducts = searchTerm.trim() === '' 
            ? this.allProducts 
            : this.allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        
        // 使用相同的平滑过渡效果
        this.updateProductsGrid(filteredProducts);
    },
    
    // 填充分类筛选器 - 完全匹配原始frontend.html的populateCategoryFilter函数
    populateCategoryFilter: async function() {
        try {
            const categories = await window.APIUtils.get(`/api/products/categories?lang=${window.I18nManager.getCurrentLanguage()}`);
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                // 保存当前选中的值
                const currentValue = categoryFilter.value;
                
                // 清空现有选项
                categoryFilter.innerHTML = '';
                
                // 添加"全部分类"选项
                const allOption = document.createElement('option');
                allOption.value = '';
                allOption.textContent = window.I18nManager.getCurrentTranslations().allCategories;
                categoryFilter.appendChild(allOption);
                
                // 添加分类选项
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
                
                // 恢复之前选中的值
                categoryFilter.value = currentValue;
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            window.MessageComponent.error('Could not load categories.');
        }
    },
    
    // 渲染产品卡片 - 完全匹配原始frontend.html的renderProductCard函数
    renderProductCard: function(product) {
        // 获取缩略图URL - 修复：正确处理product.media数据结构
        const thumbnailUrl = (product.media && product.media.length > 0) 
            ? product.media[0].asset.url 
            : '/placeholder.svg';

        return `
            <div class="product-card rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div class="mb-4">
                    <img src="${thumbnailUrl}" alt="${product.name || 'Product Image'}" class="w-full h-64 object-cover rounded-md mb-4">
                    <h3 class="text-xl font-bold mb-2 truncate">${product.name || 'Unnamed Product'}</h3>
                    <p class="text-gray-600 mb-4 text-sm h-20 overflow-hidden">${product.description || 'No description available'}</p>
                </div>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-2xl font-bold text-primary">${window.I18nManager.getCurrentTranslations().currencySymbol}${product.displayPrice || product.price}</span>
                    <div class="flex space-x-2">
                        <button onclick="addToCart(${product.id})" class="btn-primary px-3 py-2 rounded-md text-sm whitespace-nowrap">
                            ${window.I18nManager.getCurrentTranslations().addToCart}
                        </button>
                        <button onclick="showProductDetail(${product.id})" class="border border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50 whitespace-nowrap">
                            ${window.I18nManager.getCurrentTranslations().viewDetails}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 初始化轮播图 - 完全匹配原始frontend.html的initCarousel函数
    initCarousel: function(carousel) {
        if (!carousel) return;
        
        let currentSlide = 0;
        const slides = carousel.querySelectorAll('.carousel-item');
        const totalSlides = slides.length;
        
        if (totalSlides <= 1) return;
        
        // 获取轮播间隔
        const interval = parseInt(carousel.dataset.interval) || 5000;
        
        // 添加轮播方法到元素
        carousel.nextSlide = function() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        };
        
        carousel.previousSlide = function() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };
        
        function updateCarousel() {
            const carouselInner = carousel.querySelector('.carousel-inner');
            if (carouselInner) {
                carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
        }
        
        // 自动播放
        let autoPlay = setInterval(() => {
            carousel.nextSlide();
        }, interval);
        
        // 鼠标悬停时暂停自动播放
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlay);
        });
        
        carousel.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                carousel.nextSlide();
            }, interval);
        });
    },

    // 处理语言变化
    handleLanguageChange: function(newLanguage) {
        window.DEBUG_UTILS.log('shop', '处理语言变化:', newLanguage);
        
        // 重新加载产品数据（因为需要获取对应语言的数据和价格显示）
        this.loadProducts().then(() => {
            // 重新填充分类筛选器（获取对应语言的分类名称）
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                this.populateCategoryFilter();
            }
            
            // 如果当前在商店页面，重新渲染以更新搜索框等UI元素的占位符文本
            const currentPage = this.getCurrentPage();
            if (currentPage === 'shop') {
                // 只更新文本内容，避免完全重新渲染
                this.updateShopPageTexts();
            }
        }).catch(error => {
            window.DEBUG_UTILS.error('shop', '语言变化时重新加载产品失败:', error);
        });
    },

    // 更新商店页面的文本内容
    updateShopPageTexts: function() {
        // 更新页面标题
        const shopTitle = document.querySelector('#shop-page h1');
        if (shopTitle) {
            shopTitle.textContent = window.I18nManager.getCurrentTranslations().navShop;
        }
        
        // 更新搜索框占位符
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = window.I18nManager.getCurrentTranslations().search || 'Search artifacts...';
        }
        
        // 更新分类筛选器的"全部分类"选项
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && categoryFilter.options.length > 0) {
            categoryFilter.options[0].textContent = window.I18nManager.getCurrentTranslations().allCategories || 'All Categories';
        }
        
        window.DEBUG_UTILS.log('shop', '商店页面文本内容已更新');
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.ShopModule.init();
});

window.DEBUG_UTILS.log('shop', 'Shop module loaded');