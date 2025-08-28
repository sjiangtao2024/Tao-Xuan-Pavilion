/**
 * 管理界面主要逻辑
 */

class AdminDashboard {
    constructor() {
        this.loginContainer = document.getElementById('login-container');
        this.adminContainer = document.getElementById('admin-container');
        this.loginForm = document.getElementById('login-form');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.init();
    }

    async init() {
        // 绑定事件
        this.bindEvents();
        
        // 检查认证状态
        const isAuthenticated = await this.checkAuth();
        if (isAuthenticated) {
            this.showAdminInterface();
            await this.loadModules();
        } else {
            this.showLoginInterface();
        }
    }

    bindEvents() {
        // 登录表单提交
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // 退出登录
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // 导航菜单点击
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });
    }

    async checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            return false;
        }
        
        // 临时的前端验证 - 仅用于测试
        if (token === 'demo-admin-token') {
            return true;
        }
        
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (!response.ok) {
                throw new Error('认证失败');
            }
            
            return true;
        } catch (error) {
            // 如果后端不可用，但有测试token，仍然允许访问
            if (token === 'demo-admin-token') {
                return true;
            }
            localStorage.removeItem('adminToken');
            return false;
        }
    }

    showLoginInterface() {
        this.loginContainer.classList.remove('hidden');
        this.adminContainer.classList.add('hidden');
    }

    showAdminInterface() {
        this.loginContainer.classList.add('hidden');
        this.adminContainer.classList.remove('hidden');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        
        // 清除之前的错误信息
        errorDiv.style.display = 'none';
        
        // 临时的前端验证 - 仅用于测试
        if (email === 'admin' && password === 'password') {
            localStorage.setItem('adminToken', 'demo-admin-token');
            this.showAdminInterface();
            await this.loadModules();
            return;
        }
        
        try {
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                this.showAdminInterface();
                await this.loadModules();
            } else {
                errorDiv.textContent = data.error || '登录失败';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            // 如果是网络错误且使用演示账号，允许登录
            if (email === 'admin' && password === 'password') {
                localStorage.setItem('adminToken', 'demo-admin-token');
                this.showAdminInterface();
                await this.loadModules();
            } else {
                errorDiv.textContent = '登录请求失败，请使用 admin/password 进行演示';
                errorDiv.style.display = 'block';
            }
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        window.location.reload();
    }

    showSection(sectionName) {
        // 隐藏所有部分
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // 显示指定部分
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // 更新导航菜单激活状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
        
        // 特殊处理：如果是分类管理页面，加载分类列表
        if (sectionName === 'categories') {
            this.loadCategoriesData();
        }
    }

    async loadModules() {
        try {
            // 所有模块都已通过script标签加载，直接初始化
            debugInfo('admin', '开始初始化管理模块...');
            
            // 1. 初始化基础子模块
            debugInfo('admin', '初始化基础子模块...');
            
            if (typeof window.initializeProductForm === 'function') {
                window.initializeProductForm();
                debugInfo('admin', '产品表单模块已初始化');
            } else {
                debugWarn('admin', '产品表单模块未找到');
            }
            
            if (typeof window.initializeProductMedia === 'function') {
                window.initializeProductMedia();
                debugInfo('admin', '产品媒体模块已初始化');
            } else {
                debugWarn('admin', '产品媒体模块未找到');
            }
            
            if (typeof window.initializeProductEditor === 'function') {
                window.initializeProductEditor();
                debugInfo('admin', '产品编辑器模块已初始化');
            } else {
                debugWarn('admin', '产品编辑器模块未找到');
            }
            
            // 等待一下确保子模块完全初始化
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 2. 初始化主管理模块
            debugInfo('admin', '初始化主管理模块...');
            
            // 加载用户管理模块
            if (typeof window.initializeUserManagementModule === 'function') {
                window.initializeUserManagementModule();
                debugInfo('admin', '用户管理模块已初始化');
            } else {
                debugWarn('admin', '用户管理模块未找到');
            }
            
            // 加载产品管理模块
            if (typeof window.initializeProductManagementModule === 'function') {
                window.initializeProductManagementModule();
                debugInfo('admin', '产品管理模块已初始化');
                
                // 等待一下，然后检查函数是否正确暴露
                setTimeout(() => {
                    debugDebug('admin', '检查产品管理模块函数暴露:');
                    debugDebug('admin', 'addNewProduct:', typeof window.addNewProduct);
                    debugDebug('admin', 'viewProduct:', typeof window.viewProduct);
                    debugDebug('admin', 'editProductInEditMode:', typeof window.editProductInEditMode);
                }, 100);
            } else {
                debugWarn('admin', '产品管理模块未找到');
                
                // 尝试手动检查和修复
                debugInfo('admin', '尝试手动初始化...');
                if (typeof initializeProductManagementModule === 'function') {
                    debugInfo('admin', '找到全局initializeProductManagementModule函数，尝试调用');
                    initializeProductManagementModule();
                    window.initializeProductManagementModule = initializeProductManagementModule;
                } else {
                    debugError('admin', '无法找到initializeProductManagementModule函数');
                }
            }
            
            // 加载导航模块
            if (typeof window.initializeNavigationModule === 'function') {
                window.initializeNavigationModule();
                debugInfo('admin', '导航模块已初始化');
            } else {
                debugWarn('admin', '导航模块未找到');
            }
            
            // 加载分类管理模块
            if (typeof window.initializeCategoryManagementModule === 'function') {
                window.initializeCategoryManagementModule();
                debugInfo('admin', '分类管理模块已初始化');
            } else {
                debugWarn('admin', '分类管理模块未找到');
            }

            // 3. 绑定按钮事件
            this.bindModuleEvents();
            
            // 4. 加载仪表板数据
            await this.loadDashboardData();
            
            // 5. 加载初始数据
            await this.loadInitialData();
            
            debugInfo('admin', '所有管理模块初始化成功');
            
            // 检查关键模块函数是否正确加载
            this.checkModuleStatus();
        } catch (error) {
            console.error('管理模块初始化失败:', error);
            alert('管理模块初始化失败，请刷新页面重试');
        }
    }
    
    checkModuleStatus() {
        debugInfo('admin', '模块加载状态检查');
        
        const productFunctions = [
            'addNewProduct',
            'viewProduct', 
            'editProductInEditMode',
            'deleteProduct',
            'initializeProductManagementModule'
        ];
        
        productFunctions.forEach(funcName => {
            const func = window[funcName];
            debugDebug('admin', `${funcName}:`, typeof func, func ? '✓' : '✗');
        });
        
        const categoryFunctions = [
            'addNewCategory',
            'loadCategoryList',
            'initializeCategoryManagementModule'
        ];
        
        categoryFunctions.forEach(funcName => {
            const func = window[funcName];
            debugDebug('admin', `${funcName}:`, typeof func, func ? '✓' : '✗');
        });
        
        debugInfo('admin', '检查完成');
    }

    async loadDashboardData() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
            } else {
                console.error('无法加载仪表板数据');
            }
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
        }
    }

    updateDashboardStats(data) {
        const elements = {
            'total-users': data.totalUsers || 0,
            'total-orders': data.totalOrders || 0,
            'total-products': data.totalProducts || 0,
            'new-users-month': data.newUsersThisMonth || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        });
    }

    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    async loadInitialData() {
        // 加载用户数据
        await this.loadUsersData();
        
        // 加载产品数据
        await this.loadProductsData();
    }

    async loadUsersData() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/users?limit=10', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateUsersTable(data.users || []);
            }
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }

    async loadProductsData() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/products?lang=zh', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const products = await response.json();
                this.updateProductsTable(products.slice(0, 10));
            }
        } catch (error) {
            console.error('加载产品数据失败:', error);
        }
    }

    updateUsersTable(users) {
        const tbody = document.querySelector('#users-section tbody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">暂无用户数据</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${this.formatRole(user.role)}</td>
                <td><span class="status-badge status-${user.status}">${this.formatStatus(user.status)}</span></td>
                <td><button class="view-user-btn" data-user-id="${user.id}">查看</button></td>
            </tr>
        `).join('');
        
        // 重新绑定事件
        this.rebindUserEvents();
    }

    updateProductsTable(products) {
        const tbody = document.querySelector('#products-section tbody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">暂无产品数据</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name || '未命名产品'}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td><span class="status-badge ${product.featured ? 'status-featured' : 'status-normal'}">${product.featured ? '精选' : '普通'}</span></td>
                <td>正常</td>
                <td>
                    <button class="view-product-btn btn" data-product-id="${product.id}">查看</button>
                    <button class="btn btn-warning" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn btn-danger" onclick="deleteProductFromTable(${product.id})">删除</button>
                </td>
            </tr>
        `).join('');
        
        // 重新绑定事件
        this.rebindProductEvents();
    }

    formatRole(role) {
        const roleMap = {
            'user': '普通用户',
            'admin': '管理员',
            'super_admin': '超级管理员',
            'moderator': '主管'
        };
        return roleMap[role] || role;
    }

    formatStatus(status) {
        const statusMap = {
            'active': '正常',
            'disabled': '已禁用',
            'suspended': '已暂停',
            'deleted': '已删除'
        };
        return statusMap[status] || status;
    }

    rebindUserEvents() {
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = parseInt(e.target.dataset.userId);
                if (window.viewUser) {
                    window.viewUser(userId);
                }
            });
        });
    }

    rebindProductEvents() {
        document.querySelectorAll('.view-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                if (window.viewProduct) {
                    window.viewProduct(productId);
                }
            });
        });
    }

    bindModuleEvents() {
        // 用户管理按钮
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = parseInt(e.target.dataset.userId);
                if (window.viewUser) {
                    window.viewUser(userId);
                }
            });
        });

        // 新增产品按钮
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.addNewProduct) {
                    window.addNewProduct();
                }
            });
        }

        // 新增分类按钮（产品管理页面）
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.addNewCategory) {
                    window.addNewCategory();
                }
            });
        }
        
        // 新增分类按钮（分类管理主页面）
        const addCategoryMainBtn = document.getElementById('add-category-main-btn');
        if (addCategoryMainBtn) {
            addCategoryMainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.addNewCategory && typeof window.addNewCategory === 'function') {
                    window.addNewCategory();
                } else {
                    console.error('分类管理模块未加载');
                    alert('分类管理模块未加载，请刷新页面后重试');
                }
            });
        }

        // 查看产品按钮
        document.querySelectorAll('.view-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                if (window.viewProduct) {
                    window.viewProduct(productId);
                }
            });
        });
        
        // 将函数暴露到全局作用域以便模块调用
        // 这些函数在模块加载后才会可用
        
        // 暴露数据加载函数
        window.loadUsersData = () => this.loadUsersData();
        window.loadProductsData = () => this.loadProductsData();
        window.loadOrdersData = () => this.loadOrdersData();
        window.loadLogsData = () => this.loadLogsData();
    }
    
    async loadOrdersData() {
        // TODO: 实现订单数据加载
        console.log('加载订单数据...');
    }
    
    async loadLogsData() {
        // TODO: 实现日志数据加载
        console.log('加载日志数据...');
    }
    
    async loadCategoriesData() {
        console.log('加载分类数据...');
        try {
            // 调用分类管理模块的加载函数
            if (window.loadCategoryList && typeof window.loadCategoryList === 'function') {
                // 将分类列表渲染到指定的容器中
                const container = document.getElementById('category-list-container');
                if (container) {
                    // 修改全局的目标容器，然后加载数据
                    window.categoryListContainerId = 'category-list-container';
                    await window.loadCategoryList('zh');
                }
            } else {
                console.error('分类管理模块未正确加载');
            }
        } catch (error) {
            console.error('加载分类数据失败:', error);
        }
    }
}

// 页面加载完成后初始化管理界面
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

// 全局产品操作函数
window.editProduct = function(productId) {
    console.log('编辑产品:', productId);
    
    // 检查产品管理模块是否加载
    console.log('检查产品管理模块函数:');
    console.log('editProductInEditMode:', typeof window.editProductInEditMode);
    console.log('viewProduct:', typeof window.viewProduct);
    console.log('addNewProduct:', typeof window.addNewProduct);
    
    // 调用产品编辑功能（编辑模式）
    if (window.editProductInEditMode && typeof window.editProductInEditMode === 'function') {
        console.log('调用editProductInEditMode函数');
        window.editProductInEditMode(productId);
    } else if (window.viewProduct && typeof window.viewProduct === 'function') {
        console.log('降级方案：调用viewProduct函数');
        // 降级方案：使用现有的viewProduct
        window.viewProduct(productId);
    } else {
        console.error('产品管理模块未加载');
        alert('产品管理模块未加载，请刷新页面后重试');
    }
};

window.deleteProductFromTable = function(productId) {
    if (confirm('确定要删除这个产品吗？')) {
        console.log('删除产品:', productId);
        
        // 调用产品管理模块中的删除函数
        if (window.deleteProduct && typeof window.deleteProduct === 'function') {
            console.log('调用产品管理模块的deleteProduct函数');
            // 这里需要先设置编辑模式和当前产品数据
            // 但由于这是从表格直接删除，我们需要使用API调用
            deleteProductViaAPI(productId);
        } else {
            console.error('产品删除功能未加载');
            alert('产品删除功能未加载，请刷新页面后重试');
        }
    }
};

// 直接通过API删除产品
async function deleteProductViaAPI(productId) {
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
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
        
        // 刷新产品列表
        if (typeof window.loadProductsData === 'function') {
            window.loadProductsData();
        }
        
    } catch (error) {
        console.error('删除产品失败:', error);
        alert(`删除失败: ${error.message}`);
    }
}

// 全局分类管理函数
window.addNewCategory = function() {
    console.log('新增分类');
    // 调用分类管理模块的新增分类功能
    if (window.addNewCategoryFromModule && typeof window.addNewCategoryFromModule === 'function') {
        window.addNewCategoryFromModule();
    } else {
        console.error('分类管理模块未加载');
        alert('分类管理模块未加载，请刷新页面后重试');
    }
};