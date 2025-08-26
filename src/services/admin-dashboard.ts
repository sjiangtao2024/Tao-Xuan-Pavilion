/**
 * 管理员仪表板 HTML 生成服务
 */

export function generateAdminDashboard(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员仪表板 - 道玄阁</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            line-height: 1.6;
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        .login-form {
            max-width: 400px;
            margin: 100px auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #f39c12;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .login-btn {
            width: 100%;
            background: #f39c12;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.1em;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .nav-menu {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .nav-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .nav-item.active {
            background: #f39c12;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            position: relative;
            border-left: 5px solid #f39c12;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(243, 156, 18, 0.3);
        }
        
        .data-table {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); }
        th { background: rgba(255, 255, 255, 0.1); color: #f39c12; }
        
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status-active { background: #27ae60; color: white; }
        .status-disabled { background: #e74c3c; color: white; }
        
        .btn { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; text-decoration: none; }
        .btn-danger { background: #e74c3c; }
        
        .hidden { display: none; }
        .error-message { color: #e74c3c; text-align: center; margin-top: 15px; }
    </style>
</head>
<body>
    <!-- 登录表单 -->
    <div id="login-container" class="login-form">
        <h2 style="text-align: center; color: #f39c12; margin-bottom: 30px;">管理员登录</h2>
        <form id="login-form">
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" placeholder="admin@tao.com" required>
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" placeholder="请输入密码" required>
            </div>
            <button type="submit" class="login-btn">登录</button>
            <div id="error-message" class="error-message hidden"></div>
        </form>
    </div>

    <!-- 主要仪表板 -->
    <div id="dashboard-container" class="hidden">
        <div class="container">
            <div class="header">
                <h1>道玄阁管理后台</h1>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>当前登录: <strong id="current-user">管理员</strong></span>
                    <button style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;" onclick="logout()">退出登录</button>
                </div>
            </div>

            <div class="nav-menu">
                <div class="nav-item active" onclick="showSection('dashboard')">仪表板</div>
                <div class="nav-item" onclick="showSection('users')">用户管理</div>
                <div class="nav-item" onclick="showSection('orders')">订单管理</div>
                <div class="nav-item" onclick="showSection('products')">产品管理</div>
                <div class="nav-item" onclick="showSection('logs')">操作日志</div>
            </div>

            <!-- 仪表板部分 -->
            <div id="dashboard-section" class="section">
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <h3>总用户数</h3>
                        <div style="font-size: 2.5em; font-weight: bold; color: #f39c12;" id="total-users">-</div>
                    </div>
                    <div class="stat-card">
                        <h3>总订单数</h3>
                        <div style="font-size: 2.5em; font-weight: bold; color: #f39c12;" id="total-orders">-</div>
                    </div>
                    <div class="stat-card">
                        <h3>总产品数</h3>
                        <div style="font-size: 2.5em; font-weight: bold; color: #f39c12;" id="total-products">-</div>
                    </div>
                </div>
            </div>

            <!-- 用户管理部分 -->
            <div id="users-section" class="section hidden">
                <div class="data-table">
                    <h3>用户管理</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>邮箱</th>
                                <th>角色</th>
                                <th>状态</th>
                                <th>注册时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="users-table">
                            <tr><td colspan="6">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 订单管理部分 -->
            <div id="orders-section" class="section hidden">
                <div class="data-table">
                    <h3>订单管理</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>订单ID</th>
                                <th>用户邮箱</th>
                                <th>金额</th>
                                <th>状态</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table">
                            <tr><td colspan="6">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 产品管理部分 -->
            <div id="products-section" class="section hidden">
                <div class="data-table">
                    <h3>产品管理</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>产品名称</th>
                                <th>价格</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="products-table">
                            <tr><td colspan="5">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 操作日志部分 -->
            <div id="logs-section" class="section hidden">
                <div class="data-table">
                    <h3>操作日志</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>管理员</th>
                                <th>操作</th>
                                <th>目标</th>
                                <th>IP地址</th>
                            </tr>
                        </thead>
                        <tbody id="logs-table">
                            <tr><td colspan="5">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentUser = null;

        // API 辅助函数
        async function apiFetch(url, options = {}) {
            const token = localStorage.getItem('adminToken');
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
            
            if (token) {
                headers['Authorization'] = \`Bearer \${token}\`;
            }
            
            const response = await fetch(url, { ...options, headers });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('认证失败，请重新登录');
                }
                const errorData = await response.json().catch(() => ({ error: '未知错误' }));
                throw new Error(errorData.error || \`HTTP错误! 状态: \${response.status}\`);
            }
            
            return response.json();
        }

        // 登录处理
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            try {
                errorDiv.classList.add('hidden');
                const data = await apiFetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });
                
                localStorage.setItem('adminToken', data.token);
                currentUser = data.user;
                document.getElementById('current-user').textContent = data.user.email;
                
                document.getElementById('login-container').classList.add('hidden');
                document.getElementById('dashboard-container').classList.remove('hidden');
                
                loadDashboardData();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });

        // 退出登录
        function logout() {
            localStorage.removeItem('adminToken');
            currentUser = null;
            document.getElementById('login-container').classList.remove('hidden');
            document.getElementById('dashboard-container').classList.add('hidden');
            document.getElementById('login-form').reset();
        }

        // 显示部分
        function showSection(section) {
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            document.getElementById(\`\${section}-section\`).classList.remove('hidden');
            
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            event.target.classList.add('active');
            
            switch(section) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'users':
                    loadUsersData();
                    break;
                case 'orders':
                    loadOrdersData();
                    break;
                case 'products':
                    loadProductsData();
                    break;
                case 'logs':
                    loadLogsData();
                    break;
            }
        }

        // 加载仪表板数据
        async function loadDashboardData() {
            try {
                const data = await apiFetch('/api/admin/dashboard');
                document.getElementById('total-users').textContent = data.totalUsers || 0;
                document.getElementById('total-orders').textContent = data.totalOrders || 0;
                document.getElementById('total-products').textContent = data.totalProducts || 0;
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                document.getElementById('total-users').textContent = '0';
                document.getElementById('total-orders').textContent = '0';
                document.getElementById('total-products').textContent = '0';
            }
        }

        // 加载用户数据
        async function loadUsersData() {
            try {
                const data = await apiFetch('/api/admin/users');
                const usersTable = document.getElementById('users-table');
                
                if (data.users.length > 0) {
                    usersTable.innerHTML = data.users.map(user => \`
                        <tr>
                            <td>\${user.id}</td>
                            <td>\${user.email}</td>
                            <td>\${user.role}</td>
                            <td><span class="status-badge status-\${user.status}">\${user.status}</span></td>
                            <td>\${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn" onclick="alert('查看用户 \${user.id}')">查看</button>
                                <button class="btn btn-danger" onclick="alert('操作用户 \${user.id}')">操作</button>
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    usersTable.innerHTML = '<tr><td colspan="6">暂无用户数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('users-table').innerHTML = '<tr><td colspan="6">加载失败</td></tr>';
            }
        }

        // 加载订单数据
        async function loadOrdersData() {
            try {
                const data = await apiFetch('/api/admin/orders');
                const ordersTable = document.getElementById('orders-table');
                
                if (data.orders.length > 0) {
                    ordersTable.innerHTML = data.orders.map(order => \`
                        <tr>
                            <td>\${order.id}</td>
                            <td>\${order.user?.email || 'Unknown'}</td>
                            <td>$\${order.totalAmount}</td>
                            <td><span class="status-badge status-\${order.status}">\${order.status}</span></td>
                            <td>\${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn" onclick="alert('查看订单 \${order.id}')">查看详情</button>
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    ordersTable.innerHTML = '<tr><td colspan="6">暂无订单数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('orders-table').innerHTML = '<tr><td colspan="6">加载失败</td></tr>';
            }
        }

        // 加载产品数据
        async function loadProductsData() {
            try {
                const products = await apiFetch('/api/products?lang=en');
                const productsTable = document.getElementById('products-table');
                
                if (products.length > 0) {
                    productsTable.innerHTML = products.map(product => \`
                        <tr>
                            <td>\${product.id}</td>
                            <td>\${product.name || 'Unnamed Product'}</td>
                            <td>$\${product.price}</td>
                            <td><span class="status-badge status-active">\${product.featured ? '精选' : '普通'}</span></td>
                            <td>
                                <button class="btn" onclick="alert('编辑产品 \${product.id}')">编辑</button>
                                <button class="btn btn-danger" onclick="alert('删除产品 \${product.id}')">删除</button>
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    productsTable.innerHTML = '<tr><td colspan="5">暂无产品数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('products-table').innerHTML = '<tr><td colspan="5">加载失败</td></tr>';
            }
        }

        // 加载日志数据
        async function loadLogsData() {
            try {
                const data = await apiFetch('/api/admin/logs');
                const logsTable = document.getElementById('logs-table');
                
                if (data.logs.length > 0) {
                    logsTable.innerHTML = data.logs.map(log => \`
                        <tr>
                            <td>\${new Date(log.createdAt).toLocaleString()}</td>
                            <td>\${log.admin?.email || 'Unknown'}</td>
                            <td>\${log.action}</td>
                            <td>\${log.targetType} #\${log.targetId || 'N/A'}</td>
                            <td>\${log.ipAddress}</td>
                        </tr>
                    \`).join('');
                } else {
                    logsTable.innerHTML = '<tr><td colspan="5">暂无日志数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('logs-table').innerHTML = '<tr><td colspan="5">加载失败</td></tr>';
            }
        }

        // 初始化
        const token = localStorage.getItem('adminToken');
        if (token) {
            apiFetch('/api/admin/dashboard')
                .then(() => {
                    document.getElementById('login-container').classList.add('hidden');
                    document.getElementById('dashboard-container').classList.remove('hidden');
                    loadDashboardData();
                })
                .catch(() => {
                    logout();
                });
        }
    </script>
</body>
</html>`;
}