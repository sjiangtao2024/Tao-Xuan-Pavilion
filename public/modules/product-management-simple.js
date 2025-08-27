/**
 * 产品管理模块 - 简化测试版本
 */

console.log('product-management-simple.js 开始加载');

// 基本函数定义
function addNewProduct() {
    console.log('addNewProduct called');
    alert('新增产品功能（简化版）');
}

function viewProduct(productId) {
    console.log('viewProduct called with:', productId);
    alert(`查看产品 ${productId}（简化版）`);
}

function editProductInEditMode(productId) {
    console.log('editProductInEditMode called with:', productId);
    alert(`编辑产品 ${productId}（简化版）`);
}

function deleteProduct() {
    console.log('deleteProduct called');
    alert('删除产品功能（简化版）');
}

function initializeProductManagementModule() {
    console.log('产品管理模块初始化（简化版）');
    return true;
}

function closeProductModal() {
    console.log('关闭产品模态框（简化版）');
}

function switchLanguageTab(language) {
    console.log('切换语言标签:', language);
}

// 立即暴露函数到全局作用域
window.addNewProduct = addNewProduct;
window.viewProduct = viewProduct;
window.editProductInEditMode = editProductInEditMode;
window.deleteProduct = deleteProduct;
window.initializeProductManagementModule = initializeProductManagementModule;
window.closeProductModal = closeProductModal;
window.switchLanguageTab = switchLanguageTab;

console.log('product-management-simple.js 函数暴露完成');
console.log('验证函数暴露:');
console.log('window.addNewProduct:', typeof window.addNewProduct);
console.log('window.viewProduct:', typeof window.viewProduct);
console.log('window.editProductInEditMode:', typeof window.editProductInEditMode);
console.log('window.initializeProductManagementModule:', typeof window.initializeProductManagementModule);