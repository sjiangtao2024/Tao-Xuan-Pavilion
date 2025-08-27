/**
 * 产品编辑器主控制器 - 协调各个子模块工作
 * 仅负责模块协调、状态管理和界面布局
 * 具体功能委托给专门的子模块处理
 */

// 编辑器状态管理
let editorState = {
    isInitialized: false,
    currentProduct: null,
    isEditMode: false,
    isViewMode: false,
    isDirty: false,
    isLoading: false
};

// 子模块引用
let formModule = null;
let mediaModule = null;

/**
 * 初始化产品编辑器模块
 */
function initializeProductEditor() {
    if (editorState.isInitialized) {
        console.log('产品编辑器已经初始化');
        return;
    }
    
    console.log('产品编辑器主控制器初始化中...');
    
    try {
        // 创建编辑器界面
        createEditorInterface();
        
        // 初始化子模块
        initializeSubModules();
        
        // 设置事件监听
        setupMainEvents();
        
        editorState.isInitialized = true;
        console.log('产品编辑器主控制器初始化完成');
        
    } catch (error) {
        console.error('产品编辑器初始化失败:', error);
        throw error;
    }
}

/**
 * 初始化子模块
 */
function initializeSubModules() {
    // 等待DOM元素渲染完成
    setTimeout(() => {
        // 初始化表单模块
        if (typeof initializeProductForm === 'function') {
            const formInitResult = initializeProductForm();
            if (formInitResult) {
                formModule = {
                    validate: validateProductForm,
                    getData: getProductFormData,
                    populateData: populateProductFormData,
                    reset: resetProductForm,
                    isModified: isProductFormModified
                };
                console.log('表单模块初始化完成');
            } else {
                console.log('表单模块初始化延迟，等待编辑器打开时再初始化');
            }
        } else {
            console.warn('表单模块未找到');
        }
        
        // 初始化媒体模块
        if (typeof initializeProductMedia === 'function') {
            const mediaInitResult = initializeProductMedia();
            if (mediaInitResult) {
                mediaModule = {
                    getCurrentMedia: getCurrentProductMedia,
                    setCurrentMedia: setCurrentProductMedia,
                    clearMedia: clearCurrentProductMedia,
                    getThumbnailId: getThumbnailAssetId
                };
                console.log('媒体模块初始化完成');
            } else {
                console.log('媒体模块初始化延迟，等待编辑器打开时再初始化');
            }
        } else {
            console.warn('媒体模块未找到');
        }
        
        console.log('所有子模块初始化完成');
    }, 150);
}

/**
 * 创建编辑器界面
 */
function createEditorInterface() {
    // 注入基本样式
    injectBasicStyles();
    
    // 创建模态框结构
    createModalStructure();
}

/**
 * 注入基本样式
 */
function injectBasicStyles() {
    const existingStyle = document.getElementById('product-editor-core-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'product-editor-core-styles';
    style.textContent = `
        .product-editor-modal {
            display: none; position: fixed; z-index: 10000; left: 0; top: 0;
            width: 100%; height: 100%; overflow: auto;
            background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
        }
        .product-editor-content {
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            margin: 2% auto; padding: 30px; border-radius: 20px;
            width: 95%; max-width: 1200px; color: #ffffff;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
            border: 2px solid rgba(243, 156, 18, 0.4);
            max-height: 95vh; overflow-y: auto; position: relative;
        }
        .editor-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 25px; padding-bottom: 20px;
            border-bottom: 3px solid rgba(243, 156, 18, 0.4);
        }
        .editor-title {
            color: #f39c12; font-size: 1.8em; font-weight: bold; margin: 0;
            display: flex; align-items: center; gap: 10px;
        }
        .editor-close {
            color: #aaa; font-size: 32px; font-weight: bold; cursor: pointer;
            border: none; background: none; padding: 5px; border-radius: 50%;
            transition: all 0.3s;
        }
        .editor-close:hover { 
            color: #f39c12; background: rgba(243, 156, 18, 0.1); 
        }
        .editor-body {
            display: grid; grid-template-columns: 2fr 1fr; gap: 30px;
            min-height: 600px;
        }
        .editor-main { display: flex; flex-direction: column; gap: 25px; }
        .editor-sidebar {
            background: rgba(255, 255, 255, 0.03); border-radius: 15px;
            padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .editor-footer {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 30px; padding-top: 25px;
            border-top: 2px solid rgba(255, 255, 255, 0.1);
        }
        .editor-actions { display: flex; gap: 15px; }
        .editor-btn {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white; border: none; padding: 14px 24px;
            border-radius: 10px; cursor: pointer; font-size: 0.95em;
            font-weight: 600; transition: all 0.3s; min-width: 120px;
        }
        .editor-btn.primary { background: linear-gradient(135deg, #27ae60, #2ecc71); }
        .editor-btn.danger { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .editor-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
            .product-editor-content { margin: 1% auto; width: 98%; padding: 20px; }
            .editor-body { grid-template-columns: 1fr; gap: 20px; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 创建模态框结构
 */
function createModalStructure() {
    const existingModal = document.getElementById('product-editor-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="product-editor-modal" class="product-editor-modal">
            <div class="product-editor-content">
                <div class="editor-header">
                    <h2 class="editor-title">
                        <span>📝</span>
                        <span id="editor-title-text">产品编辑器</span>
                    </h2>
                    <button class="editor-close" onclick="closeProductEditor()">&times;</button>
                </div>
                
                <div class="editor-body">
                    <div class="editor-main">
                        <div id="product-form-container"></div>
                    </div>
                    
                    <div class="editor-sidebar">
                        <div id="product-media-container"></div>
                        
                        <div id="product-info" style="margin-top: 20px; display: none;">
                            <h3 style="color: #f39c12; margin-bottom: 15px;">📋 产品信息</h3>
                            <div style="font-size: 0.9em; line-height: 1.8;">
                                <div><strong>ID:</strong> <span id="product-id">-</span></div>
                                <div><strong>创建:</strong> <span id="product-created">-</span></div>
                                <div><strong>更新:</strong> <span id="product-updated">-</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="editor-footer">
                    <div class="editor-status">
                        <span id="save-status">已保存</span>
                    </div>
                    <div class="editor-actions">
                        <button class="editor-btn" onclick="closeProductEditor()">取消</button>
                        <button class="editor-btn primary" onclick="saveProductChanges()">保存</button>
                        <button class="editor-btn danger" id="delete-btn" onclick="deleteCurrentProduct()" style="display: none;">删除</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * 设置主事件监听
 */
function setupMainEvents() {
    // 模态框关闭事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductEditor();
        }
    });
    
    console.log('主事件监听设置完成');
}

/**
 * 确保子模块已初始化
 */
function ensureSubModulesInitialized() {
    console.log('检查子模块初始化状态...');
    
    // 检查表单模块
    if (!formModule) {
        console.log('检查表单模块全局函数:', {
            initializeProductForm: typeof window.initializeProductForm,
            validateProductForm: typeof window.validateProductForm,
            getProductFormData: typeof window.getProductFormData,
            populateProductFormData: typeof window.populateProductFormData,
            resetProductForm: typeof window.resetProductForm,
            isProductFormModified: typeof window.isProductFormModified
        });
        
        if (typeof window.initializeProductForm === 'function') {
            const formInitResult = window.initializeProductForm();
            if (formInitResult) {
                formModule = {
                    validate: window.validateProductForm,
                    getData: window.getProductFormData,
                    populateData: window.populateProductFormData,
                    reset: window.resetProductForm,
                    isModified: window.isProductFormModified
                };
                console.log('表单模块延迟初始化完成');
            } else {
                console.log('表单模块初始化返回false，容器可能不存在');
            }
        } else {
            console.log('表单模块初始化函数不存在');
        }
    }
    
    // 检查媒体模块
    if (!mediaModule) {
        console.log('检查媒体模块全局函数:', {
            initializeProductMedia: typeof window.initializeProductMedia,
            getCurrentProductMedia: typeof window.getCurrentProductMedia,
            setCurrentProductMedia: typeof window.setCurrentProductMedia,
            clearCurrentProductMedia: typeof window.clearCurrentProductMedia,
            getThumbnailAssetId: typeof window.getThumbnailAssetId
        });
        
        if (typeof window.initializeProductMedia === 'function') {
            const mediaInitResult = window.initializeProductMedia();
            if (mediaInitResult) {
                mediaModule = {
                    getCurrentMedia: window.getCurrentProductMedia,
                    setCurrentMedia: window.setCurrentProductMedia,
                    clearMedia: window.clearCurrentProductMedia,
                    getThumbnailId: window.getThumbnailAssetId
                };
                console.log('媒体模块延迟初始化完成');
            } else {
                console.log('媒体模块初始化返回false，容器可能不存在');
            }
        } else {
            console.log('媒体模块初始化函数不存在');
        }
    }
    
    return { formModule: !!formModule, mediaModule: !!mediaModule };
}

/**
 * 打开产品编辑器
 */
function openProductEditor(productData = null, mode = 'create') {
    if (!editorState.isInitialized) {
        console.error('产品编辑器未初始化');
        return;
    }
    
    console.log('打开产品编辑器:', mode, productData);
    
    // 确保子模块已初始化
    ensureSubModulesInitialized();
    
    // 设置编辑器状态
    editorState.currentProduct = productData;
    editorState.isEditMode = mode === 'edit';
    editorState.isViewMode = mode === 'view';
    editorState.isDirty = false;
    
    // 更新标题
    const titleText = document.getElementById('editor-title-text');
    if (titleText) {
        if (mode === 'view') {
            titleText.textContent = '查看产品';
        } else if (mode === 'edit') {
            titleText.textContent = '编辑产品';
        } else {
            titleText.textContent = '创建产品';
        }
    }
    
    // 显示/隐藏删除按钮
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = (mode === 'edit' && productData) ? 'block' : 'none';
    }
    
    // 显示/隐藏保存按钮
    const saveBtn = document.querySelector('.editor-btn.primary');
    if (saveBtn) {
        if (mode === 'view') {
            saveBtn.style.display = 'none';
        } else {
            saveBtn.style.display = 'block';
            saveBtn.textContent = '保存';
        }
    }
    
    // 设置表单是否可编辑
    setFormReadOnly(mode === 'view');
    
    // 显示模态框
    const modal = document.getElementById('product-editor-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // 延迟填充数据，确保子模块已初始化完成
    // 使用多次重试机制，确保模块完全加载
    const attemptDataPopulation = (attempts = 0) => {
        const maxAttempts = 5;
        const delay = 100 + (attempts * 100); // 递增延迟
        
        setTimeout(() => {
            console.log(`尝试填充数据 (第${attempts + 1}次)...`);
            const moduleStatus = ensureSubModulesInitialized();
            
            if (moduleStatus.formModule || attempts >= maxAttempts - 1) {
                populateEditorData(productData);
            } else {
                console.log(`模块未就绪，将在${delay}ms后重试...`);
                attemptDataPopulation(attempts + 1);
            }
        }, delay);
    };
    
    attemptDataPopulation();
}

/**
 * 填充编辑器数据
 * @param {Object} productData - 产品数据
 */
function populateEditorData(productData) {
    console.log('开始填充编辑器数据:', productData);
    
    // 再次确保子模块已初始化
    const moduleStatus = ensureSubModulesInitialized();
    console.log('模块状态:', moduleStatus);
    
    // 填充表单数据
    if (productData && formModule && formModule.populateData) {
        console.log('调用表单数据填充函数...');
        try {
            formModule.populateData(productData);
            console.log('表单数据填充成功');
            showProductInfo(productData);
        } catch (error) {
            console.error('表单数据填充失败:', error);
        }
    } else if (formModule && formModule.reset) {
        console.log('重置表单...');
        formModule.reset();
        hideProductInfo();
    } else {
        console.warn('表单模块未完全初始化:', {
            formModule: !!formModule,
            populateData: formModule ? typeof formModule.populateData : 'undefined'
        });
        
        // 如果表单模块未初始化，尝试直接调用全局函数
        if (productData && typeof window.populateProductFormData === 'function') {
            console.log('直接调用全局填充函数...');
            try {
                window.populateProductFormData(productData);
                console.log('直接调用填充函数成功');
                showProductInfo(productData);
            } catch (error) {
                console.error('直接调用填充函数失败:', error);
            }
        }
    }
    
    // 填充媒体数据
    if (productData && mediaModule && mediaModule.getCurrentMedia) {
        console.log('加载产品媒体文件...');
        loadProductMedia(productData.id);
    } else if (mediaModule && mediaModule.clearMedia) {
        console.log('清空媒体列表...');
        mediaModule.clearMedia();
    } else {
        console.warn('媒体模块未完全初始化:', {
            mediaModule: !!mediaModule,
            clearMedia: mediaModule ? typeof mediaModule.clearMedia : 'undefined'
        });
    }
    
    console.log('数据填充完成');
}

/**
 * 关闭产品编辑器
 */
function closeProductEditor() {
    // 检查是否有未保存的更改
    if (editorState.isDirty && formModule && formModule.isModified()) {
        const confirmed = confirm('您有未保存的更改，确定要关闭编辑器吗？');
        if (!confirmed) {
            return;
        }
    }
    
    // 关闭模态框
    const modal = document.getElementById('product-editor-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // 清理状态
    editorState.currentProduct = null;
    editorState.isEditMode = false;
    editorState.isViewMode = false;
    editorState.isDirty = false;
    
    console.log('产品编辑器已关闭');
}

/**
 * 保存产品更改
 */
async function saveProductChanges() {
    if (!formModule) {
        alert('表单模块未初始化');
        return;
    }
    
    console.log('开始保存产品更改');
    
    // 验证表单
    if (!formModule.validate()) {
        const errors = formModule.getValidationErrors ? formModule.getValidationErrors() : {};
        const errorMessages = Object.values(errors).join('\n');
        alert('表单验证失败：\n' + errorMessages);
        return;
    }
    
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '保存中...';
    }
    
    try {
        // 获取表单数据
        const formData = formModule.getData();
        
        // 获取媒体数据
        if (mediaModule) {
            formData.media = mediaModule.getCurrentMedia();
            formData.thumbnailAssetId = mediaModule.getThumbnailId();
        }
        
        // 发送保存请求
        const url = editorState.isEditMode ? 
            `/api/admin/products/${editorState.currentProduct.id}` : 
            '/api/admin/products';
        const method = editorState.isEditMode ? 'PUT' : 'POST';
        
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
        
        // 更新状态
        if (!editorState.isEditMode) {
            editorState.currentProduct = result;
            editorState.isEditMode = true;
            showProductInfo(result);
            const deleteBtn = document.getElementById('delete-btn');
            if (deleteBtn) deleteBtn.style.display = 'block';
        }
        
        editorState.isDirty = false;
        alert('产品保存成功！');
        
        // 刷新产品列表
        if (typeof loadProductsData === 'function') {
            loadProductsData();
        }
        
    } catch (error) {
        console.error('保存产品失败:', error);
        alert(`保存失败: ${error.message}`);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '保存';
        }
    }
}

/**
 * 删除当前产品
 */
async function deleteCurrentProduct() {
    if (!editorState.isEditMode || !editorState.currentProduct) {
        alert('无法删除：产品数据无效');
        return;
    }
    
    const productName = editorState.currentProduct.name_zh || editorState.currentProduct.name_en || '未命名产品';
    
    if (!confirm(`确定要删除产品 "${productName}" 吗？\n\n删除后无法恢复！`)) {
        return;
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = '删除中...';
    }
    
    try {
        const response = await fetch(`/api/admin/products/${editorState.currentProduct.id}`, {
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
        
        alert('产品删除成功！');
        closeProductEditor();
        
        if (typeof loadProductsData === 'function') {
            loadProductsData();
        }
        
    } catch (error) {
        console.error('删除产品失败:', error);
        alert(`删除失败: ${error.message}`);
    } finally {
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = '删除';
        }
    }
}

/**
 * 显示产品信息
 */
function showProductInfo(productData) {
    const infoPanel = document.getElementById('product-info');
    if (!infoPanel) return;
    
    const idSpan = document.getElementById('product-id');
    if (idSpan) idSpan.textContent = productData.id || '-';
    
    const createdSpan = document.getElementById('product-created');
    if (createdSpan) {
        createdSpan.textContent = productData.created_at ? 
            new Date(productData.created_at).toLocaleDateString('zh-CN') : '-';
    }
    
    const updatedSpan = document.getElementById('product-updated');
    if (updatedSpan) {
        updatedSpan.textContent = productData.updated_at ? 
            new Date(productData.updated_at).toLocaleDateString('zh-CN') : '-';
    }
    
    infoPanel.style.display = 'block';
}

/**
 * 隐藏产品信息
 */
function hideProductInfo() {
    const infoPanel = document.getElementById('product-info');
    if (infoPanel) {
        infoPanel.style.display = 'none';
    }
}

/**
 * 设置表单只读状态
 * @param {boolean} readOnly - 是否只读
 */
function setFormReadOnly(readOnly) {
    // 设置表单子模块的只读状态
    if (formModule && typeof formModule.setReadOnly === 'function') {
        formModule.setReadOnly(readOnly);
    } else {
        // 降级方案：手动设置表单元素的只读状态
        setFormElementsReadOnly(readOnly);
    }
    
    // 设置媒体模块的只读状态
    if (mediaModule && typeof mediaModule.setReadOnly === 'function') {
        mediaModule.setReadOnly(readOnly);
    } else {
        // 降级方案：隐藏上传和操作按钮
        setMediaControlsReadOnly(readOnly);
    }
}

/**
 * 手动设置表单元素的只读状态（降级方案）
 * @param {boolean} readOnly - 是否只读
 */
function setFormElementsReadOnly(readOnly) {
    const formElements = document.querySelectorAll(
        '#product-form-container input, ' +
        '#product-form-container textarea, ' +
        '#product-form-container select'
    );
    
    formElements.forEach(element => {
        if (readOnly) {
            element.setAttribute('readonly', 'readonly');
            element.setAttribute('disabled', 'disabled');
            element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            element.style.cursor = 'not-allowed';
        } else {
            element.removeAttribute('readonly');
            element.removeAttribute('disabled');
            element.style.backgroundColor = '';
            element.style.cursor = '';
        }
    });
    
    // 特殊处理复选框
    const checkboxes = document.querySelectorAll('#product-form-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (readOnly) {
            checkbox.setAttribute('disabled', 'disabled');
            checkbox.style.cursor = 'not-allowed';
        } else {
            checkbox.removeAttribute('disabled');
            checkbox.style.cursor = '';
        }
    });
}

/**
 * 设置媒体控件的只读状态（降级方案）
 * @param {boolean} readOnly - 是否只读
 */
function setMediaControlsReadOnly(readOnly) {
    // 隐藏/显示上传按钮
    const uploadBtn = document.querySelector('.media-upload-btn');
    if (uploadBtn) {
        uploadBtn.style.display = readOnly ? 'none' : 'block';
    }
    
    // 隐藏/显示上传区域
    const uploadArea = document.getElementById('media-upload-area');
    if (uploadArea) {
        uploadArea.style.display = readOnly ? 'none' : 'block';
    }
    
    // 隐藏/显示媒体操作按钮
    const mediaActions = document.querySelectorAll('.media-actions');
    mediaActions.forEach(action => {
        action.style.display = readOnly ? 'none' : 'flex';
    });
}

/**
 * 加载产品媒体文件
 */
function loadProductMedia(productId) {
    if (!productId || !mediaModule) return;
    
    console.log('加载产品媒体文件:', productId);
    
    fetch(`/api/admin/products/${productId}/media`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Failed to load media');
    })
    .then(data => {
        mediaModule.setCurrentMedia(data.media || []);
    })
    .catch(error => {
        console.error('加载媒体文件失败:', error);
        if (mediaModule) {
            mediaModule.clearMedia();
        }
    });
}

/**
 * 获取当前产品数据
 * @returns {Object|null} - 当前产品数据
 */
function getCurrentProductData() {
    return editorState.currentProduct;
}

/**
 * 检查是否为编辑模式
 * @returns {boolean} - 是否为编辑模式
 */
function isEditMode() {
    return editorState.isEditMode;
}

// 导出函数给全局使用
if (typeof window !== 'undefined') {
    window.initializeProductEditor = initializeProductEditor;
    window.openProductEditor = openProductEditor;
    window.closeProductEditor = closeProductEditor;
    window.saveProductChanges = saveProductChanges;
    window.deleteCurrentProduct = deleteCurrentProduct;
    
    // 状态访问函数
    window.getCurrentProductData = getCurrentProductData;
    window.isEditMode = isEditMode;
}

// 为模块系统导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeProductEditor,
        openProductEditor,
        closeProductEditor,
        saveProductChanges,
        deleteCurrentProduct,
        getCurrentProductData,
        isEditMode
    };
}

console.log('产品编辑器主控制器模块已加载');