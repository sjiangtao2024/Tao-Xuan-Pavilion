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
            errorDiv.textContent = '登录请求失败，请稍后重试';
            errorDiv.style.display = 'block';
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
    }

    async loadModules() {
        try {
            // 按顺序导入和初始化模块，确保依赖关系正确
            console.log('开始加载管理模块...');
            
            // 1. 首先加载基础子模块
            console.log('加载基础子模块...');
            const [
                productFormModule,
                productMediaModule,
                productEditorModule
            ] = await Promise.all([
                import('/modules/product-form.js'),
                import('/modules/product-media.js'), 
                import('/modules/product-editor.js')
            ]);
            
            // 2. 初始化基础子模块
            if (productFormModule.initializeProductForm) {
                productFormModule.initializeProductForm();
                console.log('产品表单模块已初始化');
            }
            
            if (productMediaModule.initializeProductMedia) {
                productMediaModule.initializeProductMedia();
                console.log('产品媒体模块已初始化');
            }
            
            if (productEditorModule.initializeProductEditor) {
                productEditorModule.initializeProductEditor();
                console.log('产品编辑器模块已初始化');
            }
            
            // 等待一下确保子模块完全初始化
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 3. 加载主管理模块
            console.log('加载主管理模块...');
            const [
                { viewUser, initializeUserManagementModule },
                { addNewProduct, viewProduct, initializeProductManagementModule },
                { initializeNavigationModule },
                { initializeCategoryManagementModule }
            ] = await Promise.all([
                import('/modules/user-management.js'),
                import('/modules/product-management.js'),
                import('/modules/navigation.js'),
                import('/modules/category-management.js')
            ]);

            // 4. 初始化主管理模块
            initializeUserManagementModule();
            initializeProductManagementModule();
            initializeNavigationModule();
            initializeCategoryManagementModule();

            // 5. 绑定按钮事件
            this.bindModuleEvents({ viewUser, addNewProduct, viewProduct });
            
            // 6. 加载仪表板数据
            await this.loadDashboardData();
            
            // 7. 加载初始数据
            await this.loadInitialData();
            
            console.log('所有管理模块加载成功');
        } catch (error) {
            console.error('管理模块加载失败:', error);
            alert('管理模块加载失败，请刷新页面重试');
        }
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
            tbody.innerHTML = '<tr><td colspan="5">暂无产品数据</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name || '未命名产品'}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>正常</td>
                <td>
                    <button class="view-product-btn btn" data-product-id="${product.id}">查看</button>
                    <button class="btn btn-warning" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">删除</button>
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

    bindModuleEvents({ viewUser, addNewProduct, viewProduct }) {
        // 用户管理按钮
        document.querySelectorAll('.view-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = parseInt(e.target.dataset.userId);
                viewUser(userId);
            });
        });

        // 新增产品按钮
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addNewProduct();
            });
        }

        // 新增分类按钮
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addNewCategory();
            });
        }

        // 查看产品按钮
        document.querySelectorAll('.view-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                viewProduct(productId);
            });
        });
        
        // 将函数暴露到全局作用域以便模块调用
        window.viewUser = viewUser;
        window.addNewProduct = addNewProduct;
        window.viewProduct = viewProduct;
        window.addNewCategory = addNewCategory;
        
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
}

// 页面加载完成后初始化管理界面
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

// 全局产品操作函数
window.editProduct = function(productId) {
    console.log('编辑产品:', productId);
    // 调用产品编辑功能（编辑模式）
    if (window.editProductInEditMode && typeof window.editProductInEditMode === 'function') {
        window.editProductInEditMode(productId);
    } else if (window.viewProduct && typeof window.viewProduct === 'function') {
        // 降级方案：使用现有的viewProduct
        window.viewProduct(productId);
    } else {
        console.error('产品管理模块未加载');
        alert('产品管理模块未加载，请刷新页面后重试');
    }
};

window.deleteProduct = function(productId) {
    if (confirm('确定要删除这个产品吗？')) {
        console.log('删除产品:', productId);
        // TODO: 实现产品删除功能
        if (window.deleteProductById && typeof window.deleteProductById === 'function') {
            window.deleteProductById(productId);
        } else {
            console.error('产品删除功能未加载');
            alert('产品删除功能未加载，请刷新页面后重试');
        }
    }
};

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