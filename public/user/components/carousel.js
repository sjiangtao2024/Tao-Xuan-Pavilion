/**
 * 轮播图组件
 * 用于图片和视频的轮播展示
 */

window.CarouselComponent = {
    // 模块初始化状态
    isInitialized: false,
    
    // 轮播图实例集合
    instances: new Map(),
    
    // 初始化
    init: function() {
        this.isInitialized = true;
        window.DEBUG_UTILS.log('carousel', 'Carousel component initialized');
    },
    
    // 创建轮播图
    create: function(containerId, items = [], options = {}) {
        const container = window.DOMUtils.get(containerId);
        if (!container) {
            window.DEBUG_UTILS.warn('carousel', 'Container not found:', containerId);
            return null;
        }
        
        const config = {
            autoPlay: false,
            interval: 5000,
            showIndicators: true,
            showControls: true,
            ...options
        };
        
        const carousel = {
            container: container,
            items: items,
            config: config,
            currentIndex: 0,
            autoPlayTimer: null,
            isPlaying: false
        };
        
        this.render(carousel);
        this.bindEvents(carousel);
        
        if (config.autoPlay) {
            this.startAutoPlay(carousel);
        }
        
        this.instances.set(containerId, carousel);
        window.DEBUG_UTILS.log('carousel', 'Carousel created:', containerId);
        
        return carousel;
    },
    
    // 渲染轮播图
    render: function(carousel) {
        const { container, items, config } = carousel;
        
        if (items.length === 0) {
            container.innerHTML = '<div class="carousel-empty">No items to display</div>';
            return;
        }
        
        const carouselHtml = `
            <div class="carousel">
                <div class="carousel-inner" style="transform: translateX(0%)">
                    ${items.map((item, index) => this.renderItem(item, index)).join('')}
                </div>
                ${config.showControls ? this.renderControls() : ''}
                ${config.showIndicators ? this.renderIndicators(items.length) : ''}
            </div>
        `;
        
        container.innerHTML = carouselHtml;
    },
    
    // 渲染单个项目
    renderItem: function(item, index) {
        if (item.type === 'video') {
            return `
                <div class="carousel-item" data-index="${index}">
                    <video controls>
                        <source src="${item.src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        } else {
            return `
                <div class="carousel-item" data-index="${index}">
                    <img src="${item.src}" alt="${item.alt || ''}" loading="lazy">
                </div>
            `;
        }
    },
    
    // 渲染控制按钮
    renderControls: function() {
        return `
            <button class="carousel-control prev" data-action="prev">‹</button>
            <button class="carousel-control next" data-action="next">›</button>
        `;
    },
    
    // 渲染指示器
    renderIndicators: function(count) {
        const indicators = Array.from({ length: count }, (_, index) => 
            `<button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`
        ).join('');
        
        return `<div class="carousel-indicators">${indicators}</div>`;
    },
    
    // 绑定事件
    bindEvents: function(carousel) {
        const { container } = carousel;
        
        // 控制按钮事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-control')) {
                const action = e.target.getAttribute('data-action');
                if (action === 'prev') {
                    this.prev(carousel);
                } else if (action === 'next') {
                    this.next(carousel);
                }
            }
        });
        
        // 指示器事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-indicator')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.goTo(carousel, index);
            }
        });
        
        // 鼠标悬停暂停自动播放
        if (carousel.config.autoPlay) {
            container.addEventListener('mouseenter', () => {
                this.pauseAutoPlay(carousel);
            });
            
            container.addEventListener('mouseleave', () => {
                this.resumeAutoPlay(carousel);
            });
        }
        
        // 键盘导航
        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev(carousel);
            } else if (e.key === 'ArrowRight') {
                this.next(carousel);
            }
        });
        
        // 触摸事件（移动端支持）
        this.bindTouchEvents(carousel);
    },
    
    // 绑定触摸事件
    bindTouchEvents: function(carousel) {
        const { container } = carousel;
        let startX = 0;
        let endX = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });
        
        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    this.next(carousel);
                } else {
                    this.prev(carousel);
                }
            }
        });
    },
    
    // 跳转到指定索引
    goTo: function(carousel, index) {
        if (index < 0 || index >= carousel.items.length) {
            return;
        }
        
        carousel.currentIndex = index;
        this.updateDisplay(carousel);
        this.updateIndicators(carousel);
        
        window.DEBUG_UTILS.log('carousel', 'Navigated to index:', index);
    },
    
    // 下一张
    next: function(carousel) {
        const nextIndex = (carousel.currentIndex + 1) % carousel.items.length;
        this.goTo(carousel, nextIndex);
    },
    
    // 上一张
    prev: function(carousel) {
        const prevIndex = carousel.currentIndex === 0 ? 
            carousel.items.length - 1 : carousel.currentIndex - 1;
        this.goTo(carousel, prevIndex);
    },
    
    // 更新显示
    updateDisplay: function(carousel) {
        const inner = carousel.container.querySelector('.carousel-inner');
        if (inner) {
            const translateX = -carousel.currentIndex * 100;
            inner.style.transform = `translateX(${translateX}%)`;
        }
    },
    
    // 更新指示器
    updateIndicators: function(carousel) {
        const indicators = carousel.container.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === carousel.currentIndex);
        });
    },
    
    // 开始自动播放
    startAutoPlay: function(carousel) {
        if (carousel.items.length <= 1) return;
        
        carousel.autoPlayTimer = setInterval(() => {
            this.next(carousel);
        }, carousel.config.interval);
        
        carousel.isPlaying = true;
        window.DEBUG_UTILS.log('carousel', 'Auto play started');
    },
    
    // 暂停自动播放
    pauseAutoPlay: function(carousel) {
        if (carousel.autoPlayTimer) {
            clearInterval(carousel.autoPlayTimer);
            carousel.autoPlayTimer = null;
            carousel.isPlaying = false;
            window.DEBUG_UTILS.log('carousel', 'Auto play paused');
        }
    },
    
    // 恢复自动播放
    resumeAutoPlay: function(carousel) {
        if (carousel.config.autoPlay && !carousel.isPlaying) {
            this.startAutoPlay(carousel);
        }
    },
    
    // 停止自动播放
    stopAutoPlay: function(carousel) {
        this.pauseAutoPlay(carousel);
        carousel.config.autoPlay = false;
    },
    
    // 更新轮播图内容
    update: function(containerId, newItems) {
        const carousel = this.instances.get(containerId);
        if (!carousel) {
            window.DEBUG_UTILS.warn('carousel', 'Carousel not found:', containerId);
            return;
        }
        
        carousel.items = newItems;
        carousel.currentIndex = 0;
        this.render(carousel);
        this.bindEvents(carousel);
        
        if (carousel.config.autoPlay) {
            this.stopAutoPlay(carousel);
            this.startAutoPlay(carousel);
        }
        
        window.DEBUG_UTILS.log('carousel', 'Carousel updated:', containerId);
    },
    
    // 销毁轮播图
    destroy: function(containerId) {
        const carousel = this.instances.get(containerId);
        if (!carousel) return;
        
        this.stopAutoPlay(carousel);
        carousel.container.innerHTML = '';
        this.instances.delete(containerId);
        
        window.DEBUG_UTILS.log('carousel', 'Carousel destroyed:', containerId);
    },
    
    // 获取轮播图实例
    getInstance: function(containerId) {
        return this.instances.get(containerId);
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.CarouselComponent.init();
});

window.DEBUG_UTILS.log('carousel', 'Carousel component loaded');