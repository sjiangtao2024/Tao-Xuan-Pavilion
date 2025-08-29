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
        // 添加URL调试信息
        window.DEBUG_UTILS.log('product', '当前URL信息:', {
            href: window.location.href,
            hash: window.location.hash,
            search: window.location.search
        });
        
        let productId = window.APP_STATE.currentProductId;
        
        // 如果 APP_STATE 中没有 productId，尝试从 URL 中获取
        if (!productId) {
            window.DEBUG_UTILS.log('product', '尝试从URL获取产品ID...');
            productId = this.getProductIdFromUrl();
            window.DEBUG_UTILS.log('product', '从URL获取的产品ID:', productId);
            if (productId) {
                window.APP_STATE.currentProductId = productId;
                window.DEBUG_UTILS.log('product', '从URL恢复产品ID:', productId);
            }
        }
        
        window.DEBUG_UTILS.log('product', `ProductModule.loadProductPage called`);
        window.DEBUG_UTILS.log('product', 'APP_STATE.currentProductId:', productId);
        window.DEBUG_UTILS.log('product', 'APP_STATE full object:', window.APP_STATE);
        
        if (!productId) {
            window.DEBUG_UTILS.error('product', 'No productId found in APP_STATE!');
            window.DEBUG_UTILS.log('product', '没有找到产品ID，可能原因:', [
                '1. URL格式不正确 - 应该是 #product?id=123',
                '2. 直接访问产品页面而没有产品ID',
                '3. showProductDetail()函数没有被正确调用'
            ]);
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
                window.DEBUG_UTILS.log('product', 'Found product in cache:', product);
            } else {
                window.DEBUG_UTILS.warn('product', 'ShopModule.getProduct not available, loading from server');
            }
            
            if (product) {
                this.currentProduct = product;
                this.renderProductPage(product);
                window.DEBUG_UTILS.success('product', `Product loaded from cache: ${product.name}`);
            } else {
                // 从服务器加载
                window.DEBUG_UTILS.log('product', `Product ${productId} not in cache, loading from server`);
                await this.loadProductFromServer(productId);
            }
            
        } catch (error) {
            window.DEBUG_UTILS.error('product', 'Failed to load product:', error);
            this.showProductError();
        }
    },
    
    // 从 URL 中获取产品 ID
    getProductIdFromUrl: function() {
        window.DEBUG_UTILS.log('product', 'getProductIdFromUrl 被调用');
        
        // 尝试使用全局函数
        if (typeof window.getProductIdFromUrl === 'function') {
            window.DEBUG_UTILS.log('product', '使用全局getProductIdFromUrl函数');
            const result = window.getProductIdFromUrl();
            window.DEBUG_UTILS.log('product', '全局函数返回:', result);
            return result;
        }
        
        // 备用方法：直接从 hash 中解析
        window.DEBUG_UTILS.log('product', '使用备用方法解析URL');
        const hash = window.location.hash;
        const search = window.location.search;
        
        window.DEBUG_UTILS.log('product', 'URL解析详情:', { hash, search });
        
        // 支持多种URL格式
        const patterns = [
            /[#&]product.*[?&]id=([^&]+)/,    // #product?id=123
            /[?&]id=([^&]+)/,                 // 任何位置的 ?id=123 或 &id=123
            /product\/([0-9]+)/,               // product/123
            /#([0-9]+)$/                      // 只有数字的hash
        ];
        
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            
            // 在hash中查找
            let match = hash.match(pattern);
            if (match) {
                window.DEBUG_UTILS.log('product', `在hash中找到匹配(模式${i + 1}):`, match);
                const id = parseInt(match[1]);
                if (!isNaN(id) && id > 0) {
                    window.DEBUG_UTILS.success('product', '有效的产品ID:', id);
                    return id;
                }
            }
            
            // 在search中查找
            match = search.match(pattern);
            if (match) {
                window.DEBUG_UTILS.log('product', `在search中找到匹配(模式${i + 1}):`, match);
                const id = parseInt(match[1]);
                if (!isNaN(id) && id > 0) {
                    window.DEBUG_UTILS.success('product', '有效的产品ID:', id);
                    return id;
                }
            }
        }
        
        window.DEBUG_UTILS.warn('product', '没有从URL中找到有效的产品ID');
        return null;
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
                // 使用国际化系统获取按钮文本
                const containText = window.t ? window.t('videoModeContain', '完整') : '完整';
                const coverText = window.t ? window.t('videoModeCover', '填充') : '填充';
                const fillText = window.t ? window.t('videoModeFill', '拉伸') : '拉伸';
                const containDesc = window.t ? window.t('videoModeContainDesc', 'Show complete video with possible letterboxing') : 'Show complete video with possible letterboxing';
                const coverDesc = window.t ? window.t('videoModeCoverDesc', 'Fill container, may crop content') : 'Fill container, may crop content';
                const fillDesc = window.t ? window.t('videoModeFillDesc', 'Stretch to fill, may distort') : 'Stretch to fill, may distort';
                
                mediaHtml += `
                    <div id="video-container-${index}" class="video-container cover-mode">
                        <div class="video-mode-controls">
                            <button class="video-mode-btn" onclick="setVideoMode(${index}, 'contain')" data-lang-key="videoModeContain" title="${containDesc}">${containText}</button>
                            <button class="video-mode-btn active" onclick="setVideoMode(${index}, 'cover')" data-lang-key="videoModeCover" title="${coverDesc}">${coverText}</button>
                            <button class="video-mode-btn" onclick="setVideoMode(${index}, 'fill')" data-lang-key="videoModeFill" title="${fillDesc}">${fillText}</button>
                        </div>
                        <video 
                            id="video-${index}"
                            controls 
                            preload="auto"
                            onloadedmetadata="optimizeVideoDisplay(this, ${index})"
                        >
                            <source src="${vidLink.asset.url}" type="video/mp4">
                            <p style="color: white; padding: 20px;">Your browser does not support the video tag.</p>
                        </video>
                    </div>
                `;
            });
            mediaHtml += '</div>';
        }

        // 使用更大的容器约束，与新的轮播图样式保持一致
        container.innerHTML = `<div class="max-w-[800px] mx-auto">${mediaHtml}</div>`;
        
        // 添加全局函数到window对象
        if (!window.setVideoMode) {
            window.setVideoMode = function(videoIndex, mode) {
                const container = document.getElementById(`video-container-${videoIndex}`);
                if (!container) return;
                
                const video = container.querySelector('video');
                const buttons = container.querySelectorAll('.video-mode-btn');
                
                // 更新按钮状态
                buttons.forEach(btn => btn.classList.remove('active'));
                const activeBtn = container.querySelector(`[onclick*="'${mode}'"]`);
                if (activeBtn) activeBtn.classList.add('active');
                
                // 移除所有模式类
                container.className = container.className.replace(/(contain|cover|fill)-mode/g, '');
                // 添加新模式类
                container.classList.add(`${mode}-mode`);
                
                // 根据模式调整容器和视频样式
                if (video && video.videoWidth && video.videoHeight) {
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    
                    switch(mode) {
                        case 'contain':
                            // 完整模式 - 保持原始比例，可能有黑边
                            container.style.aspectRatio = `${aspectRatio}`;
                            video.style.objectFit = 'contain';
                            video.style.width = '100%';
                            video.style.height = 'auto';
                            break;
                        case 'cover':
                            // 填充模式 - 填满容器，可能裁剪
                            container.style.aspectRatio = '16/9'; // 使用标准比例
                            video.style.objectFit = 'cover';
                            video.style.width = '100%';
                            video.style.height = '100%';
                            break;
                        case 'fill':
                            // 拉伸模式 - 强制填充，可能变形
                            container.style.aspectRatio = '16/9';
                            video.style.objectFit = 'fill';
                            video.style.width = '100%';
                            video.style.height = '100%';
                            break;
                    }
                }
                
                window.DEBUG_UTILS.log('product', `视频模式切换为: ${mode}`);
            };
        }
        
        if (!window.optimizeVideoDisplay) {
            window.optimizeVideoDisplay = function(video, index) {
                if (!video) return;
                
                // 等待视频元数据加载完成
                const optimizeSize = () => {
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;
                    const container = video.closest('.video-container');
                    
                    if (videoWidth && videoHeight && container) {
                        const aspectRatio = videoWidth / videoHeight;
                        
                        window.DEBUG_UTILS.log('product', `视频尺寸: ${videoWidth}x${videoHeight}, 比例: ${aspectRatio.toFixed(2)}`);
                        
                        // 根据视频比例智能调整容器，减少黑边
                        if (aspectRatio > 2.0) {
                            // 超宽屏视频 (21:9 等)
                            container.style.aspectRatio = `${aspectRatio}`;
                            container.style.maxHeight = '55vh';
                            container.style.width = '100%';
                        } else if (aspectRatio > 1.6) {
                            // 宽屏视频 (16:9, 16:10 等)
                            container.style.aspectRatio = `${aspectRatio}`;
                            container.style.maxHeight = '65vh';
                            container.style.width = '100%';
                        } else if (aspectRatio > 1.2) {
                            // 标准宽屏 (4:3, 3:2 等)
                            container.style.aspectRatio = `${aspectRatio}`;
                            container.style.maxHeight = '70vh';
                            container.style.width = '100%';
                        } else if (aspectRatio > 0.8) {
                            // 接近方形
                            container.style.aspectRatio = `${aspectRatio}`;
                            container.style.maxHeight = '75vh';
                            container.style.maxWidth = '75vw';
                        } else {
                            // 竖屏或窄屏视频
                            container.style.aspectRatio = `${aspectRatio}`;
                            container.style.maxHeight = '80vh';
                            container.style.maxWidth = '50vw'; // 限制竖屏视频宽度
                        }
                        
                        // 动态调整视频的object-fit以获得最佳效果
                        const containerRect = container.getBoundingClientRect();
                        if (containerRect.width && containerRect.height) {
                            const containerAspect = containerRect.width / containerRect.height;
                            const aspectDiff = Math.abs(aspectRatio - containerAspect);
                            
                            if (aspectDiff < 0.15) {
                                // 如果视频和容器比例接近，使用cover以减少黑边
                                video.style.objectFit = 'cover';
                            } else {
                                // 否则保持完整视频
                                video.style.objectFit = 'contain';
                            }
                        }
                        
                        window.DEBUG_UTILS.log('product', `容器优化完成，aspect-ratio: ${container.style.aspectRatio}, object-fit: ${video.style.objectFit}`);
                    }
                };
                
                if (video.readyState >= 1) {
                    // 元数据已加载
                    setTimeout(optimizeSize, 50); // 稍微延迟确保DOM更新完成
                } else {
                    // 等待元数据加载
                    video.addEventListener('loadedmetadata', optimizeSize, { once: true });
                }
            };
        }
        
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
        } else {
            // 如果在产品页面但没有加载新数据，只更新视频按钮文本
            this.updateVideoButtonsText();
        }
    },
    
    // 更新视频按钮文本
    updateVideoButtonsText: function() {
        const videoContainers = document.querySelectorAll('.video-container');
        videoContainers.forEach(container => {
            const buttons = container.querySelectorAll('.video-mode-btn');
            buttons.forEach(button => {
                const langKey = button.getAttribute('data-lang-key');
                if (langKey && window.t) {
                    button.textContent = window.t(langKey);
                    
                    // 更新 title 属性
                    const descKey = langKey + 'Desc';
                    const desc = window.t(descKey);
                    if (desc && desc !== descKey) {
                        button.setAttribute('title', desc);
                    }
                }
            });
        });
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