/**
 * 产品分类管理模块
 * 支持双语产品分类的增删改查功能
 */

let categoryList = [];
let currentCategoryData = null;
let isCategoryEditMode = false;

/**
 * 初始化产品分类管理
 */
function initializeCategoryManagementModule() {
    console.log('产品分类管理模块初始化');
    injectCategoryStyles();
    createCategoryModals();
    loadCategoryList('zh'); // 默认加载中文分类
}

// 为了兼容性，保留旧名称
function initializeCategoryManagement() {
    return initializeCategoryManagementModule();
}

/**
 * 注入分类管理样式
 */
function injectCategoryStyles() {
    const existingStyle = document.getElementById('category-management-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'category-management-styles';
    style.textContent = `
        .category-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .category-item { background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.3s; }
        .category-item:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-2px); }
        .category-name-zh { color: #ffffff; font-weight: bold; margin-bottom: 5px; }
        .category-name-en { color: rgba(255, 255, 255, 0.7); font-size: 0.9em; margin-bottom: 10px; }
        .category-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .category-modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); }
        .category-modal-content { background: #2d2d2d; margin: 10% auto; padding: 25px; border-radius: 15px; width: 90%; max-width: 500px; color: #ffffff; }
        .category-form-input { width: 100%; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.05); color: #ffffff; }
        .category-form-input:focus { outline: none; border-color: #f39c12; }
        .category-error { color: #e74c3c; font-size: 0.8em; }
    `;
    document.head.appendChild(style);
}

/**
 * 创建分类管理模态框
 */
function createCategoryModals() {
    const existingModal = document.getElementById('category-modal');
    if (existingModal) return;
    
    const modalHTML = `
        <div id="category-modal" class="category-modal">
            <div class="category-modal-content">
                <h3 id="category-modal-title">添加分类</h3>
                <form id="category-form">
                    <div style="margin-bottom: 15px;">
                        <label for="category-name-zh">中文名称 *</label>
                        <input type="text" id="category-name-zh" class="category-form-input" required>
                        <div class="category-error" id="category-name-zh-error"></div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="category-name-en">英文名称</label>
                        <input type="text" id="category-name-en" class="category-form-input">
                    </div>
                </form>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="save-category-btn" onclick="saveCategory()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">保存</button>
                    <button id="delete-category-btn" onclick="deleteCategory()" style="display: none; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">删除</button>
                    <button onclick="closeCategoryModal()" style="padding: 10px 20px; background: #757575; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">取消</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * 加载分类列表
 * @param {string} language - 语言代码（zh 或 en）
 */
async function loadCategoryList(language = 'zh') {
    try {
        // 使用管理员API获取分类数据，支持双语言
        const response = await fetch(`/api/admin/categories?lang=${language}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        if (response.ok) {
            categoryList = await response.json();
            console.log(`加载分类数据成功 (${language}):`, categoryList);
            renderCategoryList();
        } else {
            const error = await response.json();
            console.error('加载分类失败:', error);
            throw new Error(error.error || '加载失败');
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        // 在界面上显示错误信息
        const container = document.getElementById('category-list-container') || document.getElementById('category-list');
        if (container) {
            container.innerHTML = `<div style="text-align: center; padding: 20px; color: #f44336;">加载失败: ${error.message}</div>`;
        }
    }
}

/**
 * 渲染分类列表
 */
function renderCategoryList() {
    // 支持多个容器：产品管理页面的category-list和分类管理页面的category-list-container
    let container = document.getElementById('category-list-container') || document.getElementById('category-list');
    
    // 如果有全局设置的目标容器，优先使用
    if (window.categoryListContainerId) {
        container = document.getElementById(window.categoryListContainerId);
    }
    
    if (!container) return;
    
    // 在分类管理主页面显示语言切换按钮
    let headerHtml = '';
    if (container.id === 'category-list-container') {
        headerHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #fff;">分类列表</h4>
                <div style="display: flex; gap: 10px;">
                    <button onclick="loadCategoryList('zh')" style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">中文</button>
                    <button onclick="loadCategoryList('en')" style="padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">English</button>
                </div>
            </div>
        `;
    }
    
    if (categoryList.length === 0) {
        container.innerHTML = headerHtml + '<div style="text-align: center; padding: 20px; color: #666;">暂无分类</div>';
        return;
    }
    
    const html = categoryList.map(category => `
        <div class="category-item" onclick="editCategory(${category.id})" style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s;" 
             onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" 
             onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <div class="category-name-zh" style="color: #ffffff; font-weight: bold; margin-bottom: 5px;">${category.name_zh || category.name || '未命名'}</div>
            <div class="category-name-en" style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em; margin-bottom: 10px;">${category.name_en || '暂无英文名称'}</div>
            <div class="category-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="event.stopPropagation(); editCategory(${category.id})" style="padding: 5px 10px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">编辑</button>
                <button onclick="event.stopPropagation(); confirmDeleteCategory(${category.id})" style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">删除</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = headerHtml + html;
}

/**
 * 添加新分类
 */
function addNewCategory() {
    isCategoryEditMode = false;
    currentCategoryData = null;
    document.getElementById('category-form').reset();
    document.getElementById('category-modal-title').textContent = '添加分类';
    document.getElementById('delete-category-btn').style.display = 'none';
    document.getElementById('category-modal').style.display = 'block';
}

/**
 * 编辑分类
 */
function editCategory(categoryId) {
    const category = categoryList.find(c => c.id === categoryId);
    if (!category) return;
    
    isCategoryEditMode = true;
    currentCategoryData = category;
    
    document.getElementById('category-name-zh').value = category.name_zh || category.name || '';
    document.getElementById('category-name-en').value = category.name_en || '';
    document.getElementById('category-modal-title').textContent = '编辑分类';
    document.getElementById('delete-category-btn').style.display = 'inline-block';
    document.getElementById('category-modal').style.display = 'block';
}

/**
 * 保存分类
 */
async function saveCategory() {
    const nameZh = document.getElementById('category-name-zh').value.trim();
    const nameEn = document.getElementById('category-name-en').value.trim();
    
    if (!nameZh) {
        alert('请输入中文名称');
        return;
    }
    
    try {
        const url = isCategoryEditMode ? `/api/admin/categories/${currentCategoryData.id}` : '/api/admin/categories';
        const method = isCategoryEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name_zh: nameZh, name_en: nameEn })
        });
        
        if (response.ok) {
            alert(isCategoryEditMode ? '分类更新成功' : '分类创建成功');
            closeCategoryModal();
            loadCategoryList('zh'); // 重新加载中文分类列表
            
            // 通知产品表单刷新分类下拉框
            if (typeof window.refreshCategories === 'function') {
                window.refreshCategories();
                console.log('已通知产品表单刷新分类');
            }
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        alert(`保存失败: ${error.message}`);
    }
}

/**
 * 删除分类
 */
async function deleteCategory() {
    if (!currentCategoryData) return;
    
    try {
        const response = await fetch(`/api/admin/categories/${currentCategoryData.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        if (response.ok) {
            alert('分类删除成功');
            closeCategoryModal();
            loadCategoryList('zh'); // 重新加载中文分类列表
            
            // 通知产品表单刷新分类下拉框
            if (typeof window.refreshCategories === 'function') {
                window.refreshCategories();
                console.log('已通知产品表单刷新分类');
            }
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        alert(`删除失败: ${error.message}`);
    }
}

/**
 * 确认删除分类
 */
function confirmDeleteCategory(categoryId) {
    const category = categoryList.find(c => c.id === categoryId);
    if (confirm(`确定删除分类 "${category?.name_zh || '未知'}" 吗？`)) {
        deleteCategoryById(categoryId);
    }
}

async function deleteCategoryById(categoryId) {
    try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        if (response.ok) {
            alert('分类删除成功');
            loadCategoryList('zh'); // 重新加载中文分类列表
            
            // 通知产品表单刷新分类下拉框
            if (typeof window.refreshCategories === 'function') {
                window.refreshCategories();
                console.log('已通知产品表单刷新分类');
            }
        }
    } catch (error) {
        alert('删除失败');
    }
}

/**
 * 关闭分类模态框
 */
function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
    currentCategoryData = null;
    isCategoryEditMode = false;
}

// 对外暴露的函数
if (typeof window !== 'undefined') {
    window.initializeCategoryManagementModule = initializeCategoryManagementModule;
    window.initializeCategoryManagement = initializeCategoryManagement;
    window.addNewCategory = addNewCategory;
    window.editCategory = editCategory;
    window.saveCategory = saveCategory;
    window.deleteCategory = deleteCategory;
    window.confirmDeleteCategory = confirmDeleteCategory;
    window.closeCategoryModal = closeCategoryModal;
    window.loadCategoryList = loadCategoryList;
}

// 模块导出（仅支持CommonJS格式，避免浏览器兼容性问题）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initializeCategoryManagement, 
        initializeCategoryManagementModule,
        addNewCategory,
        editCategory,
        saveCategory,
        deleteCategory,
        confirmDeleteCategory,
        closeCategoryModal,
        loadCategoryList 
    };
}