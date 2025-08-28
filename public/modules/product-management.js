/**
/**
 * 产品管理模块 - 支持Cloudflare Workers环境
 * 提供双语产品管理和媒体文件管理功能
 * 整合产品表单管理和媒体管理子模块
 */

// 导入子模块（如果在模块环境中）
if (typeof require !== 'undefined') {
    try {
        require('./product-form.js');
        require('./product-media.js');
        require('./category-management.js');
    } catch (e) {
        debugWarn('productManagement', '子模块加载失败，请确保文件存在:', e.message);
    }
}

// 存储当前编辑的产品信息
let currentProductData = null;
let managementIsEditMode = false; // 重命名避免与product-editor.js中的isEditMode函数冲突
let moduleInitialized = false;

// 全局变量初始化完成

// 模块初始化函数
function initializeProductManagementModule() {
    if (moduleInitialized) {
        return;
    }
    
    // 检查依赖模块
    const dependencies = checkDependencies();
    if (!dependencies.allAvailable) {
        debugWarn('productManagement', '依赖模块未完全加载，将在延迟后重试');
        setTimeout(() => initializeProductManagementModule(), 500);
        return;
    }
    
    // 注入样式
    injectProductManagementStyles();
    
    // 创建模态框
    createProductManagementModals();
    
    // 初始化子模块
    initializeSubModules();
    
    moduleInitialized = true;

    
    // 立即检查函数暴露

}

// 检查依赖模块
function checkDependencies() {
    const required = {
        productForm: typeof window.initializeProductForm === 'function',
        productMedia: typeof window.initializeProductMedia === 'function',
        productEditor: typeof window.initializeProductEditor === 'function',
        openProductEditor: typeof window.openProductEditor === 'function'
    };
    
    const missing = Object.keys(required).filter(key => !required[key]);
    
    return {
        allAvailable: missing.length === 0,
        missing: missing,
        details: required
    };
}

// 初始化子模块
function initializeSubModules() {
    // 现在子模块由admin.js统一加载和初始化
    // 这里只需要检查子模块是否已经可用
    
    // 初始化分类管理模块
    if (typeof initializeCategoryManagementModule === 'function') {
        try {
            initializeCategoryManagementModule();
        } catch (error) {
            debugError('productManagement', '❗ 分类管理模块初始化失败:', error);
        }
    }
}

// 注入产品管理样式
function injectProductManagementStyles() {
    const existingStyle = document.getElementById('product-management-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'product-management-styles';
    style.textContent = `
        .product-modal {
            display: none; position: fixed; z-index: 1000; left: 0; top: 0;
            width: 100%; height: 100%; overflow: auto;
            background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
        }
        .product-modal-content {
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            margin: 3% auto; padding: 25px; border: none; border-radius: 15px;
            width: 90%; max-width: 700px; color: #ffffff;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(243, 156, 18, 0.3);
            max-height: 90vh; overflow-y: auto;
        }
        .product-modal-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 20px; padding-bottom: 15px;
            border-bottom: 2px solid rgba(243, 156, 18, 0.3);
        }
        .product-modal-title { color: #f39c12; font-size: 1.5em; font-weight: bold; margin: 0; }
        .product-close {
            color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer;
            border: none; background: none; padding: 0; width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; transition: all 0.3s;
        }
        .product-close:hover { color: #f39c12; background: rgba(243, 156, 18, 0.1); }
        
        .language-tabs {
            display: flex; margin-bottom: 20px;
            border-bottom: 2px solid rgba(243, 156, 18, 0.3);
        }
        .language-tab {
            padding: 12px 20px; background: rgba(255, 255, 255, 0.05);
            border: none; color: #ffffff; cursor: pointer;
            border-radius: 8px 8px 0 0; margin-right: 5px; transition: all 0.3s;
        }
        .language-tab.active { background: #f39c12; color: #000000; }
        .language-content { display: none; }
        .language-content.active { display: block; }
        
        .product-form-grid { display: grid; grid-template-columns: 1fr; gap: 25px; margin-bottom: 25px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-full-row { grid-column: 1 / -1; }
        .product-form-group { margin-bottom: 20px; }
        .product-form-label {
            display: block; font-weight: bold; color: #f39c12; margin-bottom: 8px;
            font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px;
        }
        .product-form-input, .product-form-select, .product-form-textarea {
            width: 100%; padding: 12px 15px; border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px; background: rgba(255, 255, 255, 0.05);
            color: #ffffff; font-size: 1em; transition: all 0.3s; box-sizing: border-box;
        }
        .product-form-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            background-repeat: no-repeat;
            background-position: right 15px center;
            background-size: 16px 12px;
            padding-right: 45px;
            cursor: pointer;
        }
        .product-form-select:hover {
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        }
        .product-form-select:focus {
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        }
        .product-form-input:focus, .product-form-select:focus, .product-form-textarea:focus {
            outline: none; border-color: #f39c12; background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
        }
        .product-form-textarea { min-height: 80px; resize: vertical; }
        .product-checkbox-group { display: flex; align-items: center; gap: 10px; }
        .product-checkbox { width: 20px; height: 20px; accent-color: #f39c12; }
        
        .media-section {
            background: rgba(255, 255, 255, 0.05); padding: 20px;
            border-radius: 10px; margin-bottom: 20px;
        }
        .media-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px; margin-top: 15px;
        }
        .media-item {
            position: relative; background: rgba(255, 255, 255, 0.1);
            border-radius: 8px; padding: 10px; text-align: center;
            border: 2px solid transparent; transition: all 0.3s;
        }
        .media-item.thumbnail { border-color: #f39c12; }
        .media-preview {
            width: 100%; height: 100px; object-fit: cover;
            border-radius: 5px; margin-bottom: 8px;
        }
        .media-type-badge {
            position: absolute; top: 5px; left: 5px;
            background: rgba(0, 0, 0, 0.8); color: white;
            padding: 2px 6px; border-radius: 3px; font-size: 0.7em;
        }
        .thumbnail-badge {
            position: absolute; top: 5px; right: 5px;
            background: #f39c12; color: black;
            padding: 2px 6px; border-radius: 3px; font-size: 0.7em; font-weight: bold;
        }
        .media-actions {
            display: flex; gap: 5px; justify-content: center; margin-top: 8px;
        }
        .media-btn {
            padding: 4px 8px; border: none; border-radius: 3px;
            cursor: pointer; font-size: 0.8em; transition: all 0.3s;
        }
        .media-btn.set-thumbnail { background: #f39c12; color: black; }
        .media-btn.delete { background: #e74c3c; color: white; }
        
        .media-upload-area {
            border: 2px dashed rgba(243, 156, 18, 0.5); border-radius: 8px;
            padding: 30px; text-align: center; margin-top: 15px;
            transition: all 0.3s; cursor: pointer;
        }
        .media-upload-area:hover {
            border-color: #f39c12; background: rgba(243, 156, 18, 0.1);
        }
        .media-upload-area.dragover {
            border-color: #f39c12; background: rgba(243, 156, 18, 0.2);
        }
        .upload-progress {
            width: 100%; height: 4px; background: rgba(255, 255, 255, 0.2);
            border-radius: 2px; margin-top: 10px; overflow: hidden;
        }
        .upload-progress-bar {
            height: 100%; background: #f39c12; width: 0; transition: width 0.3s;
        }
        
        .product-actions {
            display: flex; gap: 15px; justify-content: center; margin-top: 25px;
            padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .product-action-btn {
            background: linear-gradient(135deg, #3498db, #2980b9); color: white;
            border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;
            font-size: 0.95em; font-weight: 600; transition: all 0.3s;
            text-transform: uppercase; letter-spacing: 0.5px; min-width: 120px;
        }
        .product-action-btn:hover {
            transform: translateY(-2px); box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
        }
        .product-action-btn.danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        .product-action-btn.success {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        .product-action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        .product-info-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .product-info-label { font-weight: bold; color: #f39c12; min-width: 120px; }
        .product-info-value { color: #ffffff; flex: 1; text-align: right; }
        .hidden { display: none; }
        
        @media (max-width: 768px) {
            .product-modal-content { margin: 5% auto; width: 95%; padding: 20px; }
            .form-row { grid-template-columns: 1fr; }
            .product-actions { flex-direction: column; }
            .product-action-btn { width: 100%; }
        }
    `;
    document.head.appendChild(style);
}

// 创建产品管理模态框
function createProductManagementModals() {
    const existingModal = document.getElementById('product-modal');
    if (existingModal) return;
    
    const modalHTML = `
        <div id="product-modal" class="product-modal">
            <div class="product-modal-content">
                <div class="product-modal-header">
                    <h3 class="product-modal-title" id="product-modal-title">产品详情</h3>
                    <button class="product-close" onclick="closeProductModal()">&times;</button>
                </div>
                
                <form id="product-form">
                    <div class="language-tabs">
                        <button type="button" class="language-tab active" onclick="switchLanguageTab('zh')">中文</button>
                        <button type="button" class="language-tab" onclick="switchLanguageTab('en')">English</button>
                    </div>
                    
                    <div class="product-form-grid">
                        <div id="zh-content" class="language-content active">
                            <h4 style="color: #f39c12; margin-bottom: 15px;">中文内容</h4>
                            <div class="product-form-group">
                                <label class="product-form-label" for="product-name-zh">产品名称 (中文) *</label>
                                <input type="text" id="product-name-zh" class="product-form-input" required>
                            </div>
                            <div class="product-form-group">
                                <label class="product-form-label" for="product-description-zh">产品描述 (中文)</label>
                                <textarea id="product-description-zh" class="product-form-textarea" rows="4"></textarea>
                            </div>
                        </div>
                        
                        <div id="en-content" class="language-content">
                            <h4 style="color: #f39c12; margin-bottom: 15px;">English Content</h4>
                            <div class="product-form-group">
                                <label class="product-form-label" for="product-name-en">Product Name (English)</label>
                                <input type="text" id="product-name-en" class="product-form-input">
                            </div>
                            <div class="product-form-group">
                                <label class="product-form-label" for="product-description-en">Product Description (English)</label>
                                <textarea id="product-description-en" class="product-form-textarea" rows="4"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-full-row">
                            <h4 style="color: #f39c12; margin-bottom: 15px;">通用信息</h4>
                            <div class="form-row">
                                <div class="product-form-group">
                                    <label class="product-form-label" for="product-price">价格 (USD) *</label>
                                    <input type="number" id="product-price" class="product-form-input" step="0.01" min="0" required>
                                </div>
                                <div class="product-form-group">
                                    <label class="product-form-label" for="product-category">分类</label>
                                    <select id="product-category" class="product-form-select">
                                        <option value="">选择分类...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="product-form-group">
                                <label class="product-form-label">
                                    <div class="product-checkbox-group">
                                        <input type="checkbox" id="product-featured" class="product-checkbox">
                                        <span>精选产品</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-full-row">
                            <div class="media-section">
                                <h4 style="color: #f39c12; margin-bottom: 15px;">媒体文件管理</h4>
                                <div id="media-list" class="media-grid"></div>
                                <div class="media-upload-area" id="media-upload-area">
                                    <div>
                                        <i style="font-size: 2em; margin-bottom: 10px; display: block;">📁</i>
                                        <p>点击或拖拽文件到此处上传</p>
                                        <p style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 5px;">支持 JPG、PNG、GIF、MP4、MOV 格式</p>
                                    </div>
                                    <input type="file" id="media-upload-input" multiple accept="image/*,video/*" style="display: none;">
                                    <div class="upload-progress" id="upload-progress" style="display: none;">
                                        <div class="upload-progress-bar" id="upload-progress-bar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="product-info-section" class="hidden">
                        <h4 style="color: #f39c12; margin-bottom: 15px;">产品信息</h4>
                        <div class="product-info-row">
                            <span class="product-info-label">产品ID:</span>
                            <span class="product-info-value" id="product-id-display">-</span>
                        </div>
                        <div class="product-info-row">
                            <span class="product-info-label">创建时间:</span>
                            <span class="product-info-value" id="product-created-display">-</span>
                        </div>
                        <div class="product-info-row">
                            <span class="product-info-label">更新时间:</span>
                            <span class="product-info-value" id="product-updated-display">-</span>
                        </div>
                    </div>
                </form>
                
                <div class="product-actions">
                    <button type="button" id="save-product-btn" class="product-action-btn success" onclick="saveProduct()">保存</button>
                    <button type="button" id="delete-product-btn" class="product-action-btn danger hidden" onclick="deleteProduct()">删除</button>
                    <button type="button" class="product-action-btn" onclick="closeProductModal()">取消</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 媒体模块已由admin.js统一初始化，无需在这里重复初始化
    debugInfo('productManagement', '产品管理模态框创建完成');
}



// 语言切换函数（兼容性包装）
function switchLanguageTab(language) {
    try {
        // 优先使用产品表单管理模块的语言切换
        if (typeof window.switchLanguage === 'function') {
            window.switchLanguage(language);
            return;
        }
        
        // 降级方案：手动切换
        switchLanguageTabManually(language);
    } catch (error) {
        debugError('productManagement', '语言切换失败:', error);
        switchLanguageTabManually(language);
    }
}

// 手动语言切换（降级方案）
function switchLanguageTabManually(language) {
    // 更新标签页状态
    document.querySelectorAll('.language-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetTab = document.querySelector(`[onclick*="${language}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 更新内容显示
    document.querySelectorAll('.language-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetContent = document.getElementById(`${language}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// 显示产品模态框
function showProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭产品模态框
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // 重置表单和状态
    resetProductForm();
    currentProductData = null;
    managementIsEditMode = false;
    currentProductMedia = [];
}

// 重置产品表单
function resetProductForm() {
    try {
        // 使用产品表单管理模块重置
        if (typeof resetProductForm === 'function') {
            resetProductForm();
        } else {
            // 降级方案：手动重置
            const form = document.getElementById('product-form');
            if (form) {
                form.reset();
            }
        }
        
        // 使用媒体管理模块清空媒体列表
        if (typeof clearCurrentProductMedia === 'function') {
            clearCurrentProductMedia();
        } else {
            // 降级方案
            currentProductMedia = [];
            const mediaList = document.getElementById('media-list');
            if (mediaList) {
                mediaList.innerHTML = '';
            }
        }
        
        // 隐藏产品信息区域
        const infoSection = document.getElementById('product-info-section');
        if (infoSection) {
            infoSection.classList.add('hidden');
        }
        
        // 隐藏删除按钮
        const deleteBtn = document.getElementById('delete-product-btn');
        if (deleteBtn) {
            deleteBtn.classList.add('hidden');
        }
        
        // 切换到中文标签页
        if (typeof switchLanguageTab === 'function') {
            switchLanguageTab('zh');
        }
        
    } catch (error) {
        debugError('productManagement', '重置产品表单失败:', error);
    }
}

// 显示加载模态框
function showLoadingModal(message = '加载中...') {
    const modalHTML = `
        <div class="loading-modal" style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        ">
            <div style="
                background: #2d2d2d; color: white; padding: 30px 40px;
                border-radius: 15px; text-align: center;
                border: 2px solid #f39c12;
            ">
                <div style="
                    width: 40px; height: 40px; border: 4px solid rgba(243, 156, 18, 0.3);
                    border-top: 4px solid #f39c12; border-radius: 50%;
                    animation: spin 1s linear infinite; margin: 0 auto 15px;
                "></div>
                <div style="font-size: 1.1em;">${message}</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.querySelector('.loading-modal:last-child');
    
    // 添加动画样式
    if (!document.getElementById('loading-animation-style')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    return modal;
}

// 隐藏加载模态框
function hideLoadingModal(modal) {
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// 修改 addNewProduct 函数以使用新的编辑器
function addNewProduct() {
    debugInfo('productManagement', '添加新产品');
    
    // 确保产品编辑器已初始化
    if (typeof initializeProductEditor === 'function') {
        try {
            initializeProductEditor();
        } catch (error) {
            debugWarn('productManagement', '产品编辑器初始化警告:', error);
        }
    }
    
    // 检查产品编辑器是否可用
    if (typeof openProductEditor !== 'function') {
        debugError('productManagement', '产品编辑器模块未正确加载');
        alert('产品编辑器模块加载失败，请刷新页面后重试。');
        return;
    }
    
    // 打开产品编辑器（创建模式）
    openProductEditor(null, 'create');
}

// 查看/编辑产品
async function viewProduct(productId) {
    try {
    
        
        // 确保产品编辑器已初始化
        if (typeof initializeProductEditor === 'function') {
            try {
                initializeProductEditor();
            } catch (error) {
                debugWarn('productManagement', '产品编辑器初始化警告:', error);
            }
        }
        
        // 检查产品编辑器是否可用
        if (typeof openProductEditor !== 'function') {
            debugError('productManagement', '产品编辑器模块未正确加载');
            alert('产品编辑器模块加载失败，请刷新页面后重试。');
            return;
        }
        
        // 显示加载状态
        const loadingModal = showLoadingModal('正在加载产品信息...');
        
        // 获取产品数据
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '获取产品信息失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // 关闭加载模态框
        hideLoadingModal(loadingModal);
        
        // 打开产品编辑器（查看模式）
        openProductEditor(productData, 'view');
        
    
        
    } catch (error) {
        debugError('productManagement', '获取产品详情失败:', error);
        alert(`获取产品信息失败: ${error.message}`);
        
        // 确保关闭加载模态框
        const loadingModals = document.querySelectorAll('.loading-modal');
        loadingModals.forEach(modal => modal.remove());
    }
}

// 编辑产品（编辑模式）
async function editProductInEditMode(productId) {
    try {
    
        
        // 确保产品编辑器已初始化
        if (typeof initializeProductEditor === 'function') {
            try {
                initializeProductEditor();
            } catch (error) {
                debugWarn('productManagement', '产品编辑器初始化警告:', error);
            }
        }
        
        // 检查产品编辑器是否可用
        if (typeof openProductEditor !== 'function') {
            debugError('productManagement', '产品编辑器模块未正确加载');
            alert('产品编辑器模块加载失败，请刷新页面后重试。');
            return;
        }
        
        // 显示加载状态
        const loadingModal = showLoadingModal('正在加载产品信息...');
        
        // 获取产品数据
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '获取产品信息失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // 关闭加载模态框
        hideLoadingModal(loadingModal);
        
        // 打开产品编辑器（编辑模式）
        openProductEditor(productData, 'edit');
        
    
        
    } catch (error) {
        debugError('productManagement', '获取产品详情失败:', error);
        alert(`获取产品信息失败: ${error.message}`);
        
        // 确保关闭加载模态框
        const loadingModals = document.querySelectorAll('.loading-modal');
        loadingModals.forEach(modal => modal.remove());
    }
}

// 填充产品表单
function populateProductForm(productData) {
    try {
        // 使用产品表单管理模块填充数据
        if (typeof populateProductFormData === 'function') {
            populateProductFormData(productData);
        } else {
            // 降级到手动填充
            populateProductFormManually(productData);
        }
        
        // 填充产品信息显示区域
        populateProductInfo(productData);
        
    } catch (error) {
        debugError('productManagement', '填充产品表单失败:', error);
        // 降级到手动填充
        populateProductFormManually(productData);
    }
}

// 手动填充产品表单（降级方案）
function populateProductFormManually(productData) {
    // 填充中文字段
    const nameZh = document.getElementById('product-name-zh');
    if (nameZh) nameZh.value = productData.name_zh || '';
    
    const descZh = document.getElementById('product-description-zh');
    if (descZh) descZh.value = productData.description_zh || '';
    
    // 填充英文字段
    const nameEn = document.getElementById('product-name-en');
    if (nameEn) nameEn.value = productData.name_en || '';
    
    const descEn = document.getElementById('product-description-en');
    if (descEn) descEn.value = productData.description_en || '';
    
    // 填充通用字段
    const price = document.getElementById('product-price');
    if (price) price.value = productData.price || '';
    
    const category = document.getElementById('product-category');
    if (category) category.value = productData.categoryId || '';
    
    const featured = document.getElementById('product-featured');
    if (featured) featured.checked = productData.featured || false;
}

// 填充产品信息显示区域
function populateProductInfo(productData) {
    const idDisplay = document.getElementById('product-id-display');
    if (idDisplay) idDisplay.textContent = productData.id || '-';
    
    const createdDisplay = document.getElementById('product-created-display');
    if (createdDisplay) {
        createdDisplay.textContent = productData.created_at ? 
            new Date(productData.created_at).toLocaleString('zh-CN') : '-';
    }
    
    const updatedDisplay = document.getElementById('product-updated-display');
    if (updatedDisplay) {
        updatedDisplay.textContent = productData.updated_at ? 
            new Date(productData.updated_at).toLocaleString('zh-CN') : '-';
    }
}

// 加载产品媒体文件
async function loadProductMedia(productId) {
    try {
        const response = await fetch(`/api/admin/products/${productId}/media`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const mediaData = await response.json();
            const mediaList = mediaData.media || [];
            
            // 使用媒体管理模块设置媒体列表
            if (typeof setCurrentProductMedia === 'function') {
                setCurrentProductMedia(mediaList);
            } else {
                // 降级方案
                currentProductMedia = mediaList;
                renderMediaList();
            }
        } else {
            debugWarn('productManagement', '加载媒体文件失败:', response.status);
            if (typeof clearCurrentProductMedia === 'function') {
                clearCurrentProductMedia();
            } else {
                currentProductMedia = [];
                renderMediaList();
            }
        }
    } catch (error) {
        debugError('productManagement', '加载媒体文件出错:', error);
        if (typeof clearCurrentProductMedia === 'function') {
            clearCurrentProductMedia();
        } else {
            currentProductMedia = [];
            renderMediaList();
        }
    }
}

// 渲染媒体文件列表（降级方案）
function renderMediaListFallback() {
    // 如果媒体管理模块可用，则委托给专门的模块
    if (typeof window.setCurrentProductMedia === 'function') {
        return;
    }
    
    const mediaList = document.getElementById('media-list');
    if (!mediaList) {
        return;
    }
    
    if (!currentProductMedia || currentProductMedia.length === 0) {
        mediaList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">暂无媒体文件</div>';
        return;
    }
    
    // 简化的媒体列表渲染
    const mediaHTML = currentProductMedia.map((media, index) => {
        return `
            <div class="media-item ${media.is_thumbnail ? 'thumbnail' : ''}" data-media-id="${media.id || index}">
                <div class="media-preview">
                    ${media.url ? `<img src="${media.url}" alt="产品图片" loading="lazy">` : '<div>📄</div>'}
                </div>
                <div class="media-actions">
                    ${!media.is_thumbnail ? `<button onclick="setThumbnail(${media.id || index})">缩略图</button>` : ''}
                    <button onclick="deleteMedia(${media.id || index})">删除</button>
                </div>
            </div>
        `;
    }).join('');
    
    mediaList.innerHTML = mediaHTML;
}







// 保存产品
async function saveProduct() {
    try {
        let formData;
        let isValid = true;
        
        // 使用产品表单管理模块获取和验证数据
        if (typeof validateProductForm === 'function' && typeof getProductFormData === 'function') {
            isValid = validateProductForm();
            if (!isValid) {
                const errors = typeof getProductFormValidationErrors === 'function' 
                    ? getProductFormValidationErrors() : {};
                const firstError = Object.values(errors)[0];
                alert(firstError || '表单验证失败，请检查输入');
                return;
            }
            formData = getProductFormData();
        } else {
            // 降级方案：手动获取和验证
            formData = {
                name_zh: document.getElementById('product-name-zh')?.value?.trim() || '',
                name_en: document.getElementById('product-name-en')?.value?.trim() || '',
                description_zh: document.getElementById('product-description-zh')?.value?.trim() || '',
                description_en: document.getElementById('product-description-en')?.value?.trim() || '',
                price: parseFloat(document.getElementById('product-price')?.value) || 0,
                categoryId: document.getElementById('product-category')?.value || null,
                featured: document.getElementById('product-featured')?.checked || false,
                media: typeof getCurrentProductMedia === 'function' 
                    ? getCurrentProductMedia() : (currentProductMedia || [])
            };
            
            // 基本验证
            if (!formData.name_zh) {
                alert('请输入产品中文名称');
                if (typeof switchLanguageTab === 'function') {
                    switchLanguageTab('zh');
                }
                document.getElementById('product-name-zh')?.focus();
                return;
            }
            
            if (formData.price <= 0) {
                alert('请输入有效的产品价格');
                document.getElementById('product-price')?.focus();
                return;
            }
        }
        
        // 禁用保存按钮
        const saveBtn = document.getElementById('save-product-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';
        }
        
        // 发送请求
        const url = managementIsEditMode ? `/api/admin/products/${currentProductData.id}` : '/api/admin/products';
        const method = managementIsEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '保存失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 成功提示
        alert(managementIsEditMode ? '产品更新成功！' : '产品创建成功！');
        
        // 关闭模态框
        closeProductModal();
        
        // 刷新产品列表（如果在产品管理页面）
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
        
    } catch (error) {
        debugError('productManagement', '保存产品失败:', error);
        alert(`保存失败: ${error.message}`);
    } finally {
        // 恢复保存按钮
        const saveBtn = document.getElementById('save-product-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
        }
    }
}

// 删除产品
async function deleteProduct() {
    if (!managementIsEditMode || !currentProductData) {
        alert('无法删除：产品数据无效');
        return;
    }
    
    if (!confirm(`确定要删除产品 "${currentProductData.name_zh || currentProductData.name_en}" 吗？\n\n删除后无法恢复！`)) {
        return;
    }
    
    try {
        // 禁用删除按钮
        const deleteBtn = document.getElementById('delete-product-btn');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.textContent = '删除中...';
        }
        
        const response = await fetch(`/api/admin/products/${currentProductData.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '删除失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        // 成功提示
        alert('产品删除成功！');
        
        // 关闭模态框
        closeProductModal();
        
        // 刷新产品列表
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
        
    } catch (error) {
        debugError('productManagement', '删除产品失败:', error);
        alert(`删除失败: ${error.message}`);
    } finally {
        // 恢复删除按钮
        const deleteBtn = document.getElementById('delete-product-btn');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = '删除';
        }
    }
}

// 获取当前产品数据（供子模块使用）
function getCurrentProductData() {
    return currentProductData;
}

// 检查是否为编辑模式（供子模块使用）
function checkIsEditMode() {
    return managementIsEditMode;
}

// 兼容性函数：设置缩略图
function setThumbnail(mediaId) {
    if (typeof setMediaAsThumbnail === 'function') {
        setMediaAsThumbnail(mediaId);
    } else {
        debugWarn('productManagement', '媒体管理模块未找到');
    }
}

// 兼容性函数：删除媒体
function deleteMedia(mediaId) {
    if (typeof deleteMediaItem === 'function') {
        deleteMediaItem(mediaId);
    } else {
        debugWarn('productManagement', '媒体管理模块未找到');
    }
}

// 新增分类功能（供全局调用）
function addNewCategoryFromModule() {
    debugInfo('productManagement', '从产品管理模块调用新增分类');
    
    // 直接检查分类管理模块是否可用
    if (typeof window.initializeCategoryManagementModule === 'function') {
        debugInfo('productManagement', '分类管理模块可用，继续检查新增功能');
        
        // 直接使用全局作用域中分类管理模块暴露的原始函数
        // 这个函数应该是分类管理模块的原始实现
        const categoryModule = {
            addNewCategory: function() {
                // 直接调用分类模块内部的逻辑
                const isCategoryEditMode = false;
                const currentCategoryData = null;
                
                // 检查模态框是否存在
                const categoryModal = document.getElementById('category-modal');
                if (categoryModal) {
                    // 重置表单
                    const form = document.getElementById('category-form');
                    if (form) form.reset();
                    
                    // 设置标题
                    const title = document.getElementById('category-modal-title');
                    if (title) title.textContent = '添加分类';
                    
                    // 隐藏删除按钮
                    const deleteBtn = document.getElementById('delete-category-btn');
                    if (deleteBtn) deleteBtn.style.display = 'none';
                    
                    // 显示模态框
                    categoryModal.style.display = 'block';
                } else {
                    debugError('productManagement', '分类模态框未找到，请在分类管理页面使用此功能');
                    alert('请在分类管理页面使用新增分类功能');
                }
            }
        };
        
        categoryModule.addNewCategory();
    } else {
        console.error('分类管理模块未找到');
        alert('分类管理功能未加载，请在分类管理页面使用此功能');
    }
}

// 对外暴露的函数
debugInfo('productManagement', '开始暴露函数到window对象');
if (typeof window !== 'undefined') {
    debugInfo('productManagement', 'window对象存在，开始暴露函数...');
    
    window.addNewProduct = addNewProduct;
    debugDebug('productManagement', '暴露 addNewProduct:', typeof addNewProduct);
    
    window.viewProduct = viewProduct;
    debugDebug('productManagement', '暴露 viewProduct:', typeof viewProduct);
    
    window.editProductInEditMode = editProductInEditMode;
    debugDebug('productManagement', '暴露 editProductInEditMode:', typeof editProductInEditMode);
    
    window.saveProduct = saveProduct;
    window.deleteProduct = deleteProduct;
    window.switchLanguageTab = switchLanguageTab;
    window.setThumbnail = setThumbnail;
    window.deleteMedia = deleteMedia;
    window.closeProductModal = closeProductModal;
    
    // 供子模块使用的函数
    window.getCurrentProductData = getCurrentProductData;
    window.checkIsEditMode = checkIsEditMode;
    
    // 主模块初始化
    window.initializeProductManagementModule = initializeProductManagementModule;
    debugDebug('productManagement', '暴露 initializeProductManagementModule:', typeof initializeProductManagementModule);
    
    // 分类管理相关函数
    window.addNewCategoryFromModule = addNewCategoryFromModule;
    
    debugInfo('productManagement', '函数暴露完成');
} else {
    debugError('productManagement', 'window对象不存在！');
}

// 导出模块初始化函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initializeProductManagementModule,
        addNewProduct,
        viewProduct,
        saveProduct,
        deleteProduct,
        switchLanguageTab,
        setThumbnail,
        deleteMedia,
        closeProductModal,
        getCurrentProductData,
        checkIsEditMode,
        addNewCategoryFromModule
    };
}

// 立即检查函数是否正确暴露
// 模块加载完成
debugDebug('productManagement', 'window.initializeProductManagementModule:', typeof window.initializeProductManagementModule);