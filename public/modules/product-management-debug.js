/**
 * 产品管理模块 - 调试版本
 * 只包含基本函数，用于排查问题
 */

console.log('=== product-management-debug.js 开始加载 ===');

// 存储当前编辑的产品信息
let currentProductData = null;
let managementIsEditMode = false; // 重命名避免与product-editor.js中的isEditMode函数冲突
let moduleInitialized = false;

console.log('=== 全局变量初始化完成 ===');

// 模块初始化函数 - 最简版
function initializeProductManagementModule() {
    console.log('=== initializeProductManagementModule 被调用 ===');
    
    if (moduleInitialized) {
        console.log('产品管理模块已经初始化过');
        return;
    }
    
    console.log('产品管理模块初始化中...');
    
    // 跳过所有复杂检查，直接初始化
    console.log('跳过依赖检查，直接完成初始化');
    
    moduleInitialized = true;
    console.log('产品管理模块初始化完成');
    
    // 立即检查函数暴露
    console.log('验证函数暴露状态:');
    console.log('addNewProduct:', typeof window.addNewProduct);
    console.log('viewProduct:', typeof window.viewProduct);
    console.log('editProductInEditMode:', typeof window.editProductInEditMode);
}

// 简单的产品管理函数
// 查看/编辑产品 - 增强版本
async function viewProduct(productId) {
    console.log('viewProduct called with:', productId, '- enhanced version');
    
    try {
        // 检查产品编辑器是否可用
        if (typeof openProductEditor === 'function') {
            console.log('产品编辑器可用，使用编辑器打开');
            // 简化版：不加载数据，直接打开编辑器
            openProductEditor(null, 'view');
        } else {
            console.log('产品编辑器不可用，使用简单提示');
            alert(`查看产品 ${productId}（调试版-无编辑器）`);
        }
    } catch (error) {
        console.error('viewProduct出错:', error);
        alert(`查看产品失败: ${error.message}`);
    }
}

function editProductInEditMode(productId) {
    console.log('editProductInEditMode called with:', productId, '- enhanced version');
    
    try {
        // 检查产品编辑器是否可用
        if (typeof openProductEditor === 'function') {
            console.log('产品编辑器可用，使用编辑器打开');
            // 简化版：不加载数据，直接打开编辑器
            openProductEditor(null, 'edit');
        } else {
            console.log('产品编辑器不可用，使用简单提示');
            alert(`编辑产品 ${productId}（调试版-无编辑器）`);
        }
    } catch (error) {
        console.error('editProductInEditMode出错:', error);
        alert(`编辑产品失败: ${error.message}`);
    }
}

function addNewProduct() {
    console.log('addNewProduct called - enhanced version');
    
    try {
        // 检查产品编辑器是否可用
        if (typeof openProductEditor === 'function') {
            console.log('产品编辑器可用，使用编辑器创建');
            openProductEditor(null, 'create');
        } else {
            console.log('产品编辑器不可用，使用简单提示');
            alert('新增产品功能（调试版-无编辑器）');
        }
    } catch (error) {
        console.error('addNewProduct出错:', error);
        alert(`新增产品失败: ${error.message}`);
    }
}

function deleteProduct() {
    console.log('deleteProduct called - debug version');
    alert('删除产品功能（调试版）');
}

function closeProductModal() {
    console.log('关闭产品模态框（调试版）');
}

function switchLanguageTab(language) {
    console.log('切换语言标签:', language, '- debug version');
}

console.log('=== 调试版函数定义完成 ===');

// 立即暴露函数到全局作用域
console.log('=== 开始暴露函数到window对象 ===');
if (typeof window !== 'undefined') {
    console.log('window对象存在，开始暴露函数...');
    
    window.addNewProduct = addNewProduct;
    console.log('暴露 addNewProduct:', typeof addNewProduct);
    
    window.viewProduct = viewProduct;
    console.log('暴露 viewProduct:', typeof viewProduct);
    
    window.editProductInEditMode = editProductInEditMode;
    console.log('暴露 editProductInEditMode:', typeof editProductInEditMode);
    
    window.deleteProduct = deleteProduct;
    window.initializeProductManagementModule = initializeProductManagementModule;
    window.closeProductModal = closeProductModal;
    window.switchLanguageTab = switchLanguageTab;
    
    console.log('=== 调试版函数暴露完成 ===');
} else {
    console.error('window对象不存在！');
}

console.log('=== product-management-debug.js 加载完成 ===');
console.log('验证函数暴露:');
console.log('window.addNewProduct:', typeof window.addNewProduct);
console.log('window.viewProduct:', typeof window.viewProduct);
console.log('window.editProductInEditMode:', typeof window.editProductInEditMode);