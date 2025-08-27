/**
/**
 * 管理仪表板导航模块
 * 处理统计卡片点击跳转功能
 */

function initializeNavigationModule() {
    // 为统计卡片添加点击事件
    setupStatCardNavigation();
}

/**
 * 设置统计卡片的导航功能
 */
function setupStatCardNavigation() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        addNavigationToStatCards();
    });
    
    // 如果DOM已经加载完成，直接执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addNavigationToStatCards);
    } else {
        addNavigationToStatCards();
    }
}

/**
 * 为统计卡片添加导航功能
 */
function addNavigationToStatCards() {
    // 统计卡片配置
    const statCardConfigs = [
        {
            elementId: 'total-users',
            targetSection: 'users',
            title: '用户管理',
            description: '查看所有用户信息'
        },
        {
            elementId: 'total-orders', 
            targetSection: 'orders',
            title: '订单管理',
            description: '查看所有订单详情'
        },
        {
            elementId: 'total-products',
            targetSection: 'products', 
            title: '产品管理',
            description: '管理商品信息'
        }
    ];

    statCardConfigs.forEach(config => {
        const element = document.getElementById(config.elementId);
        if (element) {
            makeStatCardClickable(element, config);
        }
    });
}

/**
 * 使统计卡片可点击
 */
function makeStatCardClickable(element, config) {
    const parentCard = element.closest('.stat-card');
    if (!parentCard) return;

    // 添加点击样式
    parentCard.style.cursor = 'pointer';
    parentCard.style.transition = 'all 0.3s ease';
    
    // 添加悬停效果
    parentCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.boxShadow = '0 15px 40px rgba(243, 156, 18, 0.4)';
    });
    
    parentCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-5px) scale(1)';
        this.style.boxShadow = '0 10px 30px rgba(243, 156, 18, 0.3)';
    });

    // 添加点击事件
    parentCard.addEventListener('click', function(e) {
        e.preventDefault();
        navigateToSection(config.targetSection, config.title);
    });

    // 添加提示标识
    addNavigationHint(parentCard, config.description);
}

/**
 * 导航到指定部分
 */
function navigateToSection(sectionName, sectionTitle) {
    // 调用现有的showSection函数
    if (typeof window.showSection === 'function') {
        window.showSection(sectionName);
    } else {
        // 备用导航方法
        showSectionFallback(sectionName, sectionTitle);
    }

    // 添加导航动画效果
    addNavigationAnimation();
}

/**
 * 备用导航方法
 */
function showSectionFallback(sectionName, sectionTitle) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    // 显示目标部分
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // 更新导航菜单激活状态
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const targetNav = document.querySelector(`[onclick*="${sectionName}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    // 更新页面标题
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = sectionTitle;
    }

    // 根据部分加载相应数据
    loadSectionData(sectionName);
}

/**
 * 加载部分数据
 */
function loadSectionData(sectionName) {
    const loadFunctions = {
        'users': 'loadUsersData',
        'orders': 'loadOrdersData', 
        'products': 'loadProductsData',
        'logs': 'loadLogsData'
    };

    const functionName = loadFunctions[sectionName];
    if (functionName && typeof window[functionName] === 'function') {
        window[functionName]();
    }
}

/**
 * 添加导航提示
 */
function addNavigationHint(cardElement, description) {
    // 创建提示元素
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: absolute;
        bottom: 5px;
        right: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        pointer-events: none;
    `;
    hint.textContent = '📊 点击查看';
    hint.title = description;

    // 确保父元素是相对定位
    cardElement.style.position = 'relative';
    cardElement.appendChild(hint);
}

/**
 * 添加导航动画效果
 */
function addNavigationAnimation() {
    // 添加页面切换动画
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0.8';
        container.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 50);
    }
}

// 导出模块
window.NavigationModule = {
    initialize: initializeNavigationModule,
    navigateToSection: navigateToSection
};

// ES6 模块导出
export {
    initializeNavigationModule,
    navigateToSection
};

// 为模块系统导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigationModule,
        navigateToSection
    };
}