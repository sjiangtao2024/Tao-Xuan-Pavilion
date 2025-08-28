/**
 * 产品详情模块
 * 处理产品详情页面的展示和交互
 */

window.ProductModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前产品
    currentProduct: null,
    
    // 轮播图实例
    carousel: null,
    
    // 初始化
    init: function() {
        this.bindEvents();
        this.isInitialized = true;
        window.DEBUG_UTILS.log('product', 'Product module initialized');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 监听页面切换事件
        window.EventUtils.on(window.APP_EVENTS.PAGE_CHANGED, (event) => {
            if (event.detail === 'product') {
                this.loadProductPage();
            }
        });
        
        // 监听产品加载事件
        window.EventUtils.on(window.APP_EVENTS.PRODUCT_LOADED, (event) => {
            this.currentProduct = event.detail;
            this.renderProductPage();
        });
        
        // 监听语言变化事件
        window.EventUtils.on(window.APP_EVENTS.LANGUAGE_CHANGED, (event) => {
            this.handleLanguageChange(event.detail);
        });
    },
    
    // 加载产品页面
    loadProductPage: async function() {
        const productId = window.APP_STATE.currentProductId;
        
        window.DEBUG_UTILS.log('product', `loadProductPage called. currentProductId: ${productId}`);
        console.log('🔍 ProductModule.loadProductPage called');
        console.log('📝 APP_STATE.currentProductId:', productId);
        console.log('📝 APP_STATE full object:', window.APP_STATE);
        
        if (!productId) {
            console.error('❌ No productId found in APP_STATE!');
            window.DEBUG_UTILS.error('product', 'No product ID provided');
            this.showProductNotFound();
            return;
        }
        
        try {
            // 先从本地数据中查找
            let product = null;
            if (window.ShopModule && typeof window.ShopModule.getProduct === 'function') {
                product = window.ShopModule.getProduct(productId);
                window.DEBUG_UTILS.log('product', `Attempting to get product ${productId} from ShopModule`);
                console.log('📺 Found product in cache:', product);
            } else {
                window.DEBUG_UTILS.warn('product', 'ShopModule.getProduct not available, loading from server');
                console.warn('⚠️ ShopModule.getProduct not available');
            }
            
            if (product) {
                this.currentProduct = product;
                this.renderProductPage(product);
                window.DEBUG_UTILS.success('product', `Product loaded from cache: ${product.name}`);
            } else {
                // 从服务器加载
                window.DEBUG_UTILS.log('product', `Product ${productId} not in cache, loading from server`);
                console.log('🌐 Loading product from server...');
                await this.loadProductFromServer(productId);
            }
            
        } catch (error) {
            window.DEBUG_UTILS.error('product', 'Failed to load product:', error);
            console.error('❌ Error loading product:', error);
            this.showProductError();
        }
    },
    
    // 从服务器加载产品 - 完全匹配frontend.html的showProductDetail实现
    loadProductFromServer: async function(productId) {
        try {
            window.DEBUG_UTILS.log('product', `Loading product ${productId} from server`);
            
            // 使用与frontend.html相同的API调用方式
            const product = await window.APIUtils.get(`/api/products/${productId}?lang=${window.I18nManager.getCurrentLanguage()}`);
            
            if (product && product.id) {
                // 预计算价格 - 完全匹配原始逻辑
                const rate = window.ShopModule ? await window.ShopModule.getExchangeRate() : 7.17;
                if (window.I18nManager.getCurrentLanguage() === 'zh') {
                    product.displayPrice = (product.price * rate).toFixed(2);
                } else {
                    product.displayPrice = product.price.toFixed(2);
                }
                
                this.currentProduct = product;
                window.EventUtils.emit(window.APP_EVENTS.PRODUCT_LOADED, product);
                this.renderProductPage(product);
                window.DEBUG_UTILS.success('product', `Product loaded successfully: ${product.name}`);
            } else {
                throw new Error('Product data is invalid or missing');
            }
            
        } catch (error) {
            window.DEBUG_UTILS.error('product', 'Failed to load product:', error);
            this.showProductNotFound();
        }
    },
    
    // 渲染产品页面 - 完全匹配frontend.html的showProductDetail实现
    renderProductPage: function(product) {
        if (!product) {
            this.showProductNotFound();
            return;
        }
        
        const productPage = window.DOMUtils.get('#product-page');
        if (!productPage) return;
        
        // 完全匹配frontend.html中showProductDetail的HTML结构
        productPage.innerHTML = `
            <section class="py-12 px-4">
                <div class="container mx-auto">
                    <button onclick="NavigationModule.navigateTo('shop')" class="mb-8 text-gold hover:text-primary">&larr; Back to All Artifacts</button>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div id="product-media-container"></div>
                        <div>
                            <h1 class="text-4xl font-serif-sc font-bold mb-4 text-gold">${product.name}</h1>
                            <p class="text-gray-400 mb-6 leading-relaxed">${product.description}</p>
                            <div class="text-4xl font-bold text-primary mb-8">${window.I18nManager.getCurrentTranslations().currencySymbol}${product.displayPrice}</div>
                            <button onclick="addToCart(${product.id})" class="btn-primary w-full py-4 text-lg rounded-lg font-semibold transform hover:scale-105 transition-transform">
                                ${window.I18nManager.getCurrentTranslations().addToCart}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // 使用与frontend.html相同的renderProductMedia函数
        this.renderProductMedia(product.media, 'product-media-container');
        
        // 滚动到顶部
        window.scrollTo(0, 0);
        
        window.DEBUG_UTILS.success('product', `Product page rendered: ${product.name}`);
    },
    
    // 渲染产品媒体 - 完全匹配frontend.html的renderProductMedia函数
    renderProductMedia: function(media, containerId) {
        const container = document.getElementById(containerId);
        if (!media || media.length === 0) {
            container.innerHTML = '<img src="/placeholder.svg" alt="Product Image" class="w-full h-full object-cover rounded-lg">';
            return;
        }

        // 完全匹配frontend.html中的媒体数据结构处理
        const images = media.filter(m => m.asset && m.asset.mediaType === 'image');
        const videos = media.filter(m => m.asset && m.asset.mediaType === 'video');

        let mediaHtml = '';

        if (images.length > 0) {
            mediaHtml += `
                <div class="carousel relative w-full overflow-hidden rounded-lg shadow-lg mb-4">
                    <div class="carousel-inner flex transition-transform duration-500 ease-in-out">
                        ${images.map(imgLink => `
                            <div class="carousel-item min-w-full">
                                <img src="${imgLink.asset.url}" alt="Product Image" class="w-full h-auto object-contain" style="max-height: 500px;">
                            </div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="carousel-control prev absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10">‹</button>
                        <button class="carousel-control next absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10">›</button>
                    ` : ''}
                </div>
            `;
        }

        if (videos.length > 0) {
            const videoGridClass = videos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';
            mediaHtml += `<div class="${videos.length > 0 && images.length > 0 ? 'mt-4' : ''} grid ${videoGridClass} gap-4">`;
            videos.forEach((vidLink, index) => {
                mediaHtml += `
                    <div style="background-color: #000; border-radius: 0.5rem; padding: 0; margin-bottom: 1rem; display: flex; justify-content: center; align-items: center; min-height: 280px;">
                        <video controls preload="auto" style="max-height: 500px; max-width: 100%; height: auto; width: auto; border-radius: 0.5rem;">
                            <source src="${vidLink.asset.url}" type="video/mp4">
                            <p style="color: white; padding: 20px;">Your browser does not support the video tag.</p>
                        </video>
                    </div>
                `;
            });
            mediaHtml += '</div>';
        }

        // 使用与frontend.html相同的容器约束
        container.innerHTML = `<div class="max-w-[600px] mx-auto">${mediaHtml}</div>`;
        
        // 初始化轮播图
        if (images.length > 1) {
            const carousel = container.querySelector('.carousel');
            if (carousel) {
                this.initCarousel(carousel);
            }
        }
    },

    // 初始化轮播图 - 完全匹配frontend.html的initCarousel函数
    initCarousel: function(carousel) {
        if (!carousel) return;

        const inner = carousel.querySelector('.carousel-inner');
        const items = carousel.querySelectorAll('.carousel-item');
        const prevBtn = carousel.querySelector('.carousel-control.prev');
        const nextBtn = carousel.querySelector('.carousel-control.next');
        
        if (items.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        let currentIndex = 0;
        let intervalId = null;

        function updateCarousel() {
            const translateX = -currentIndex * 100;
            inner.style.transform = `translateX(${translateX}%)`;
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }

        function startAutoplay() {
            stopAutoplay();
            intervalId = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(intervalId);
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoplay(); });

        startAutoplay();
    },
    // 获取当前产品
    getCurrentProduct: function() {
        return this.currentProduct;
    },

    // 显示产品未找到
    showProductNotFound: function() {
        const productPage = window.DOMUtils.get('#product-page');
        if (!productPage) return;
        
        productPage.innerHTML = `
            <div class="error-page py-16 text-center">
                <div class="container">
                    <h1 class="text-4xl font-bold text-gold mb-4">Product Not Found</h1>
                    <p class="text-gray-400 mb-8">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <button class="btn-primary px-6 py-3 rounded-lg" onclick="NavigationModule.navigateTo('shop')">
                        Back to Shop
                    </button>
                </div>
            </div>
        `;
    },

    // 处理语言变化
    handleLanguageChange: function(newLanguage) {
        window.DEBUG_UTILS.log('product', '处理语言变化:', newLanguage);
        
        // 如果当前正在产品页面且有产品ID，重新加载产品数据
        const currentPage = window.NavigationModule ? window.NavigationModule.getCurrentPage() : null;
        if (currentPage === 'product' && window.APP_STATE.currentProductId) {
            // 重新从服务器加载产品数据（获取对应语言的产品信息）
            this.loadProductFromServer(window.APP_STATE.currentProductId);
        }
    },

    // 清理资源
    cleanup: function() {
        this.currentProduct = null;
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.ProductModule.init();
});

window.DEBUG_UTILS.log('product', 'Product module loaded');