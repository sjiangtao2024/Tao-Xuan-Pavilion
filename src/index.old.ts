import { Hono } from 'hono';
import type { AppContext } from './types';
import { corsMiddleware } from './middleware';
import { authRoutes, productRoutes, cartRoutes, adminRoutes, staticRoutes } from './routes';
import { generateAdminDashboard, generateOpenApiSpec } from './services';

import html from './frontend.html';

const app = new Hono<AppContext>();

// 应用 CORS 中间件
app.use('/api/*', corsMiddleware);

// 主页路由
app.get('/', (c) => c.html(html));

// 管理员仪表板路由
app.get('/admin', (c) => {
    return c.html(generateAdminDashboard());
});

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
        
        /* 仪表板增强样式 */
        .dashboard-overview {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .overview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .overview-title {
            color: #f39c12;
            font-size: 1.5em;
            margin: 0;
        }
        
        .quick-actions {
            display: flex;
            gap: 10px;
        }
        
        .quick-btn {
            background: rgba(52, 152, 219, 0.8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s;
        }
        
        .quick-btn:hover {
            background: rgba(52, 152, 219, 1);
        }
        
        .chart-container {
            margin-top: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .trend-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .trend-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            font-weight: 600;
            color: #ecf0f1;
        }
        
        .trend-data {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .trend-bars {
            display: flex;
            align-items: end;
            gap: 4px;
            height: 60px;
            padding: 5px 0;
        }
        
        .bar {
            flex: 1;
            background: linear-gradient(to top, #3498db, #5dade2);
            border-radius: 2px 2px 0 0;
            min-height: 5px;
            transition: all 0.3s ease;
            opacity: 0.8;
        }
        
        .bar:hover {
            opacity: 1;
            transform: scaleY(1.1);
        }
        
        .trend-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .trend-change {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .trend-change.positive {
            color: #27ae60;
        }
        
        .trend-change.negative {
            color: #e74c3c;
        }
        
        .trend-change.neutral {
            color: #95a5a6;
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
        
        .stat-card .icon {
            font-size: 3em;
            color: #f39c12;
            margin-bottom: 15px;
            display: block;
        }
        
        .stat-card h3 {
            color: #ecf0f1;
            margin-bottom: 10px;
            font-size: 1.1em;
            font-weight: 600;
        }
        
        .stat-card .number {
            font-size: 2.5em;
            font-weight: bold;
            color: #f39c12;
            margin-bottom: 10px;
        }
        
        .stat-card .trend {
            font-size: 0.9em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .trend-up {
            color: #27ae60;
        }
        
        .trend-down {
            color: #e74c3c;
        }
        
        .trend-neutral {
            color: #95a5a6;
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
        
        /* 模态框样式 */
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            margin: 5% auto;
            padding: 20px;
            border-radius: 10px;
            width: 80%;
            max-width: 600px;
            max-height: 80%;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 15px;
        }
        
        .modal-title {
            color: #f39c12;
            margin: 0;
        }
        
        .close {
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }
        
        .close:hover {
            color: #fff;
        }
        
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .form-row .form-group {
            flex: 1;
            margin-bottom: 0;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #f39c12;
            font-weight: bold;
        }
        
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            box-sizing: border-box;
        }
        
        .form-group input::placeholder, .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        
        .btn-success {
            background: #27ae60;
            margin-right: 10px;
        }
        
        .btn-success:hover {
            background: #229954;
        }
        
        .media-upload {
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 15px 0;
            transition: border-color 0.3s;
        }
        
        .media-upload:hover {
            border-color: #f39c12;
        }
        
        .media-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .media-item {
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .media-item img, .media-item video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .media-item .remove-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .thumbnail-indicator {
            position: absolute;
            bottom: 5px;
            left: 5px;
            background: #f39c12;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
        }
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
                <div class="nav-item active" onclick="showSection('dashboard')">
                    <i class="fas fa-chart-line"></i> 仪表板
                </div>
                <div class="nav-item" onclick="showSection('users')">
                    <i class="fas fa-users"></i> 用户管理
                </div>
                <div class="nav-item" onclick="showSection('orders')">
                    <i class="fas fa-shopping-cart"></i> 订单管理
                </div>
                <div class="nav-item" onclick="showSection('products')">
                    <i class="fas fa-box"></i> 产品管理
                </div>
                <div class="nav-item" onclick="showSection('logs')">
                    <i class="fas fa-file-alt"></i> 操作日志
                </div>
            </div>

            <!-- 仪表板部分 -->
            <div id="dashboard-section" class="section">
                <!-- 数据统计卡片 -->
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <i class="fas fa-users icon"></i>
                        <h3>总用户数</h3>
                        <div class="number" id="total-users">-</div>
                        <div class="trend trend-up">
                            <i class="fas fa-arrow-up"></i>
                            <span id="users-trend">+12% 本月</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-shopping-cart icon"></i>
                        <h3>总订单数</h3>
                        <div class="number" id="total-orders">-</div>
                        <div class="trend trend-up">
                            <i class="fas fa-arrow-up"></i>
                            <span id="orders-trend">+8% 本月</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-box icon"></i>
                        <h3>总产品数</h3>
                        <div class="number" id="total-products">-</div>
                        <div class="trend trend-neutral">
                            <i class="fas fa-minus"></i>
                            <span id="products-trend">本月无变化</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-dollar-sign icon"></i>
                        <h3>本月收入</h3>
                        <div class="number" id="monthly-revenue">$0</div>
                        <div class="trend trend-up">
                            <i class="fas fa-arrow-up"></i>
                            <span id="revenue-trend">+15% 本月</span>
                        </div>
                    </div>
                </div>

                <!-- 概览信息 -->
                <div class="dashboard-overview">
                    <div class="overview-header">
                        <h3 class="overview-title">
                            <i class="fas fa-chart-bar"></i> 系统概览
                        </h3>
                        <div class="quick-actions">
                            <button class="quick-btn" onclick="refreshDashboard()">
                                <i class="fas fa-sync-alt"></i> 刷新数据
                            </button>
                            <button class="quick-btn" onclick="exportData()">
                                <i class="fas fa-download"></i> 导出报告
                            </button>
                        </div>
                    </div>
                    
                    <div style="color: #ecf0f1; line-height: 1.8;">
                        <p style="margin-bottom: 15px;">
                            <i class="fas fa-info-circle" style="color: #3498db; margin-right: 8px;"></i>
                            欢迎使用道玄阁管理后台！您可以通过上方的导航菜单管理用户、订单、产品和查看操作日志。
                        </p>
                        <p style="margin-bottom: 15px;">
                            <i class="fas fa-clock" style="color: #f39c12; margin-right: 8px;"></i>
                            最后更新时间：<span id="last-update">加载中...</span>
                        </p>
                        <p>
                            <i class="fas fa-server" style="color: #27ae60; margin-right: 8px;"></i>
                            系统状态：<span style="color: #27ae60; font-weight: bold;">正常运行</span>
                        </p>
                    </div>
                    
                    <!-- 简化的数据趋势展示 -->
                    <div class="chart-container">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h4 style="color: #f39c12; margin: 0;">
                                <i class="fas fa-chart-line"></i> 数据趋势展示
                            </h4>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div class="trend-item">
                                <div class="trend-header">
                                    <i class="fas fa-users" style="color: #3498db;"></i>
                                    <span>用户增长</span>
                                </div>
                                <div class="trend-data">
                                    <div class="trend-bars">
                                        <div class="bar" style="height: 20%;"></div>
                                        <div class="bar" style="height: 40%;"></div>
                                        <div class="bar" style="height: 60%;"></div>
                                        <div class="bar" style="height: 80%;"></div>
                                        <div class="bar" style="height: 100%;"></div>
                                        <div class="bar" style="height: 90%;"></div>
                                    </div>
                                    <div class="trend-summary">
                                        <span class="trend-change positive">+12%</span>
                                        <small>过去6个月</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="trend-item">
                                <div class="trend-header">
                                    <i class="fas fa-shopping-cart" style="color: #27ae60;"></i>
                                    <span>订单增长</span>
                                </div>
                                <div class="trend-data">
                                    <div class="trend-bars">
                                        <div class="bar" style="height: 30%;"></div>
                                        <div class="bar" style="height: 50%;"></div>
                                        <div class="bar" style="height: 70%;"></div>
                                        <div class="bar" style="height: 85%;"></div>
                                        <div class="bar" style="height: 100%;"></div>
                                        <div class="bar" style="height: 95%;"></div>
                                    </div>
                                    <div class="trend-summary">
                                        <span class="trend-change positive">+8%</span>
                                        <small>过去6个月</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="trend-item">
                                <div class="trend-header">
                                    <i class="fas fa-dollar-sign" style="color: #f39c12;"></i>
                                    <span>收入增长</span>
                                </div>
                                <div class="trend-data">
                                    <div class="trend-bars">
                                        <div class="bar" style="height: 25%;"></div>
                                        <div class="bar" style="height: 45%;"></div>
                                        <div class="bar" style="height: 65%;"></div>
                                        <div class="bar" style="height: 80%;"></div>
                                        <div class="bar" style="height: 100%;"></div>
                                        <div class="bar" style="height: 110%;"></div>
                                    </div>
                                    <div class="trend-summary">
                                        <span class="trend-change positive">+15%</span>
                                        <small>过去6个月</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 4px solid #3498db;">
                            <p style="margin: 0; color: #ecf0f1; font-size: 0.9em;">
                                <i class="fas fa-info-circle" style="color: #3498db; margin-right: 8px;"></i>
                                简化版数据展示，无需外部依赖，适合初期使用。待数据量增加后可升级为完整图表功能。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 快速数据表格 -->
                <div class="data-table">
                    <h3>
                        <i class="fas fa-tachometer-alt" style="margin-right: 10px;"></i>
                        快速数据查看
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <h4 style="color: #3498db; margin-bottom: 10px;">
                                <i class="fas fa-user-plus"></i> 新用户注册
                            </h4>
                            <p>今日：<span id="today-users" style="color: #f39c12; font-weight: bold;">-</span></p>
                            <p>本周：<span id="week-users" style="color: #f39c12; font-weight: bold;">-</span></p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <h4 style="color: #27ae60; margin-bottom: 10px;">
                                <i class="fas fa-shopping-bag"></i> 订单统计
                            </h4>
                            <p>今日订单：<span id="today-orders" style="color: #f39c12; font-weight: bold;">-</span></p>
                            <p>待处理：<span id="pending-orders" style="color: #e74c3c; font-weight: bold;">-</span></p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                                <i class="fas fa-cogs"></i> 系统信息
                            </h4>
                            <p>数据库连接：<span style="color: #27ae60; font-weight: bold;">正常</span></p>
                            <p>存储使用：<span id="storage-usage" style="color: #f39c12; font-weight: bold;">-</span></p>
                        </div>
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
                                <th>最后登录</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="users-table">
                            <tr><td colspan="7">加载中...</td></tr>
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
                    <p style="margin-bottom: 20px;">
                        <button class="btn btn-success" onclick="showCreateProductModal()">新增产品</button>
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>产品名称</th>
                                <th>价格 (USD)</th>
                                <th>分类</th>
                                <th>状态</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="products-table">
                            <tr><td colspan="7">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 操作日志部分 -->
            <div id="logs-section" class="section hidden">
                <div class="data-table">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>操作日志</h3>
                        <div>
                            <button class="btn" style="background: #e67e22; margin-right: 10px;" onclick="cleanupLogs()">
                                <i class="fas fa-broom"></i> 清理旧日志
                            </button>
                            <button class="btn" onclick="loadLogsData()">
                                <i class="fas fa-sync-alt"></i> 刷新
                            </button>
                        </div>
                    </div>
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

    <!-- 用户详情模态框 -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">用户详情</h3>
                <span class="close" onclick="closeUserModal()">&times;</span>
            </div>
            <div id="userModalContent">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID</label>
                        <input type="text" id="userId" readonly>
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input type="email" id="userEmail" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>角色</label>
                        <select id="userRole">
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                            <option value="super_admin">超级管理员</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>状态</label>
                        <select id="userStatus">
                            <option value="active">激活</option>
                            <option value="disabled">禁用</option>
                            <option value="suspended">暂停</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>注册时间</label>
                        <input type="text" id="userCreatedAt" readonly>
                    </div>
                    <div class="form-group">
                        <label>最后登录</label>
                        <input type="text" id="userLastLogin" readonly>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="saveUserChanges()">保存修改</button>
                    <button class="btn" style="background: #f39c12;" onclick="resetUserPassword()">重置密码</button>
                    <button class="btn" onclick="closeUserModal()">取消</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 产品管理模态框 -->
    <div id="productModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="productModalTitle">新增产品</h3>
                <span class="close" onclick="closeProductModal()">&times;</span>
            </div>
            <div id="productModalContent">
                <input type="hidden" id="productId">
                <div class="form-row">
                    <div class="form-group">
                        <label>产品名称 (中文)</label>
                        <input type="text" id="productNameZh" placeholder="请输入中文名称" required>
                    </div>
                    <div class="form-group">
                        <label>产品名称 (英文)</label>
                        <input type="text" id="productNameEn" placeholder="Please enter English name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>产品描述 (中文)</label>
                    <textarea id="productDescZh" rows="3" placeholder="请输入中文描述"></textarea>
                </div>
                <div class="form-group">
                    <label>产品描述 (英文)</label>
                    <textarea id="productDescEn" rows="3" placeholder="Please enter English description"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>价格 (USD)</label>
                        <input type="number" id="productPrice" step="0.01" placeholder="0.00" required>
                    </div>
                    <div class="form-group">
                        <label>分类</label>
                        <select id="productCategory" required>
                            <option value="">请选择分类</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="productFeatured"> 精选产品
                    </label>
                </div>
                <div class="form-group">
                    <label>产品图片/视频</label>
                    <div class="media-upload" onclick="document.getElementById('productMedia').click()">
                        <p>点击或拖拽上传文件</p>
                        <input type="file" id="productMedia" multiple accept="image/*,video/*" style="display: none;" onchange="handleMediaUpload(this)">
                    </div>
                    <div id="mediaPreview" class="media-preview"></div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-success" onclick="saveProduct()">保存产品</button>
                    <button class="btn" onclick="closeProductModal()">取消</button>
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

        // 登录
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
            // 隐藏所有部分
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            // 显示选定部分
            document.getElementById(\`\${section}-section\`).classList.remove('hidden');
            
            // 更新活动菜单项
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            event.target.classList.add('active');
            
            // 加载部分数据
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
                
                // 更新主要统计数据
                document.getElementById('total-users').textContent = data.totalUsers || 0;
                document.getElementById('total-orders').textContent = data.totalOrders || 0;
                document.getElementById('total-products').textContent = data.totalProducts || 0;
                document.getElementById('monthly-revenue').textContent = '$' + (data.monthlyRevenue || 0);
                
                // 更新快速数据
                document.getElementById('today-users').textContent = data.todayUsers || 0;
                document.getElementById('week-users').textContent = data.weekUsers || 0;
                document.getElementById('today-orders').textContent = data.todayOrders || 0;
                document.getElementById('pending-orders').textContent = data.pendingOrders || 0;
                document.getElementById('storage-usage').textContent = data.storageUsage || '未知';
                
                // 更新最后更新时间
                document.getElementById('last-update').textContent = new Date().toLocaleString();
                
                // 模拟趋势数据（实际项目中应该从后端获取）
                updateTrendIndicators(data);
                
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                // 显示默认值
                document.getElementById('total-users').textContent = '0';
                document.getElementById('total-orders').textContent = '0';
                document.getElementById('total-products').textContent = '0';
                document.getElementById('monthly-revenue').textContent = '$0';
                document.getElementById('last-update').textContent = '加载失败';
            }
        }
        
        // 更新趋势指示器
        function updateTrendIndicators(data) {
            // 这里可以根据实际数据来计算趋势
            // 为了演示，我们使用模拟数据
            const trends = {
                users: data.usersTrend || '+12%',
                orders: data.ordersTrend || '+8%',
                products: data.productsTrend || '0%',
                revenue: data.revenueTrend || '+15%'
            };
            
            document.getElementById('users-trend').textContent = trends.users + ' 本月';
            document.getElementById('orders-trend').textContent = trends.orders + ' 本月';
            document.getElementById('products-trend').textContent = trends.products === '0%' ? '本月无变化' : trends.products + ' 本月';
            document.getElementById('revenue-trend').textContent = trends.revenue + ' 本月';
        }
        
        // 刷新仪表板数据
        function refreshDashboard() {
            // 添加加载动画效果
            const refreshBtn = document.querySelector('.quick-btn');
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            
            loadDashboardData().finally(() => {
                // 移除动画效果
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                }, 1000);
            });
        }
        
        // 导出数据报告
        function exportData() {
            // 模拟导出功能
            const data = {
                exportTime: new Date().toISOString(),
                totalUsers: document.getElementById('total-users').textContent,
                totalOrders: document.getElementById('total-orders').textContent,
                totalProducts: document.getElementById('total-products').textContent,
                monthlyRevenue: document.getElementById('monthly-revenue').textContent
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-report-' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('数据报告已导出！');
        }
        
        // 清理旧日志
        async function cleanupLogs() {
            const days = prompt('请输入要保留的日志天数（默认30天）:', '30');
            if (!days || isNaN(days) || days < 1) {
                alert('请输入有效的天数（大于0）');
                return;
            }
            
            if (!confirm('确定要清理' + days + '天前的所有日志吗？此操作不可逆！')) {
                return;
            }
            
            try {
                const response = await apiFetch('/api/admin/logs/cleanup?days=' + days, {
                    method: 'DELETE'
                });
                
                alert(response.message || '日志清理成功！');
                loadLogsData(); // 重新加载日志数据
            } catch (error) {
                alert('清理日志失败: ' + error.message);
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
                            <td>\${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '从未登录'}</td>
                            <td>
                                <button class="btn" onclick="viewUser(\${user.id})">查看</button>
                                \${user.role !== 'super_admin' ? \`<button class="btn btn-danger" onclick="toggleUserStatus(\${user.id}, '\${user.status}')">
                                    \${user.status === 'active' ? '禁用' : '启用'}
                                </button>\` : ''}
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    usersTable.innerHTML = '<tr><td colspan="7">暂无用户数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('users-table').innerHTML = '<tr><td colspan="7">加载失败</td></tr>';
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
                            <td>\${product.categoryName || 'No Category'}</td>
                            <td><span class="status-badge status-active">\${product.featured ? '精选' : '普通'}</span></td>
                            <td>\${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <button class="btn" onclick="editProduct(\${product.id})">编辑</button>
                                <button class="btn btn-danger" onclick="deleteProduct(\${product.id})">删除</button>
                            </td>
                        </tr>
                    \`).join('');
                } else {
                    productsTable.innerHTML = '<tr><td colspan="7">暂无产品数据</td></tr>';
                }
            } catch (error) {
                document.getElementById('products-table').innerHTML = '<tr><td colspan="7">加载失败</td></tr>';
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

        // 切换用户状态
        async function toggleUserStatus(userId, currentStatus) {
            const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
            try {
                await apiFetch(\`/api/admin/users/\${userId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                loadUsersData(); // 重新加载用户数据
            } catch (error) {
                alert('操作失败: ' + error.message);
            }
        }

        // 检查是否已经登录
        function checkAuth() {
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
        }

        // 初始化
        checkAuth();
        
        // ===== 用户管理功能 =====
        
        // 查看用户详情
        async function viewUser(userId) {
            try {
                const user = await apiFetch(\`/api/admin/users/\${userId}\`);
                
                // 填充用户信息
                document.getElementById('userId').value = user.id;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userRole').value = user.role;
                document.getElementById('userStatus').value = user.status;
                document.getElementById('userCreatedAt').value = new Date(user.createdAt).toLocaleString();
                document.getElementById('userLastLogin').value = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '从未登录';
                
                // 显示模态框
                document.getElementById('userModal').style.display = 'block';
            } catch (error) {
                alert('获取用户信息失败: ' + error.message);
            }
        }
        
        // 关闭用户模态框
        function closeUserModal() {
            document.getElementById('userModal').style.display = 'none';
        }
        
        // 保存用户修改
        async function saveUserChanges() {
            const userId = document.getElementById('userId').value;
            const role = document.getElementById('userRole').value;
            const status = document.getElementById('userStatus').value;
            
            try {
                // 更新用户状态
                await apiFetch(\`/api/admin/users/\${userId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                
                alert('用户信息更新成功');
                closeUserModal();
                loadUsersData(); // 重新加载用户数据
            } catch (error) {
                alert('更新用户信息失败: ' + error.message);
            }
        }
        
        // 重置用户密码
        async function resetUserPassword() {
            const userId = document.getElementById('userId').value;
            const userEmail = document.getElementById('userEmail').value;
            
            if (!confirm(\`确定要重置用户 \${userEmail} 的密码吗？\`)) {
                return;
            }
            
            try {
                const response = await apiFetch(\`/api/admin/users/\${userId}/reset-password\`, {
                    method: 'POST'
                });
                
                // 显示临时密码
                const tempPassword = response.tempPassword;
                alert(\`密码重置成功！\n\n用户邮箱: \${userEmail}\n临时密码: \${tempPassword}\n\n请将此临时密码告知用户，并提醒用户登录后及时修改密码。\`);
                
                closeUserModal();
                loadUsersData(); // 重新加载用户数据
            } catch (error) {
                alert('密码重置失败: ' + error.message);
            }
        }
        
        // ===== 产品管理功能 =====
        
        let selectedMedia = [];
        let categories = [];
        
        // 加载分类数据
        async function loadCategories() {
            try {
                categories = await apiFetch('/api/products/categories?lang=en');
                const categorySelect = document.getElementById('productCategory');
                categorySelect.innerHTML = '<option value="">请选择分类</option>';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } catch (error) {
                // console.error('加载分类失败:', error);
            }
        }
        
        // 显示创建产品模态框
        function showCreateProductModal() {
            document.getElementById('productModalTitle').textContent = '新增产品';
            document.getElementById('productId').value = '';
            document.getElementById('productNameZh').value = '';
            document.getElementById('productNameEn').value = '';
            document.getElementById('productDescZh').value = '';
            document.getElementById('productDescEn').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productCategory').value = '';
            document.getElementById('productFeatured').checked = false;
            selectedMedia = [];
            updateMediaPreview();
            
            loadCategories();
            document.getElementById('productModal').style.display = 'block';
        }
        
        // 编辑产品
        async function editProduct(productId) {
            try {
                const product = await apiFetch(\`/api/products/\${productId}?lang=en\`);
                
                document.getElementById('productModalTitle').textContent = '编辑产品';
                document.getElementById('productId').value = product.id;
                document.getElementById('productNameEn').value = product.name || '';
                document.getElementById('productDescEn').value = product.description || '';
                document.getElementById('productPrice').value = product.price || '';
                document.getElementById('productCategory').value = product.categoryId || '';
                document.getElementById('productFeatured').checked = product.featured || false;
                
                // 获取中文翻译
                const zhProduct = await apiFetch(\`/api/products/\${productId}?lang=zh\`);
                document.getElementById('productNameZh').value = zhProduct.name || '';
                document.getElementById('productDescZh').value = zhProduct.description || '';
                
                // 转换媒体数据格式
                selectedMedia = (product.media || []).map(m => ({
                    type: m.asset.mediaType,
                    url: m.asset.url,
                    name: m.asset.r2Key || 'media'
                }));
                updateMediaPreview();
                
                await loadCategories();
                document.getElementById('productCategory').value = product.categoryId || '';
                document.getElementById('productModal').style.display = 'block';
            } catch (error) {
                alert('获取产品信息失败: ' + error.message);
            }
        }
        
        // 关闭产品模态框
        function closeProductModal() {
            document.getElementById('productModal').style.display = 'none';
        }
        
        // 处理媒体上传
        function handleMediaUpload(input) {
            const files = Array.from(input.files);
            
            files.forEach(file => {
                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        selectedMedia.push({
                            file: file,
                            url: e.target.result,
                            type: file.type.startsWith('image/') ? 'image' : 'video',
                            name: file.name
                        });
                        updateMediaPreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            input.value = ''; // 清空输入
        }
        
        // 更新媒体预览
        function updateMediaPreview() {
            const preview = document.getElementById('mediaPreview');
            preview.innerHTML = '';
            
            selectedMedia.forEach((media, index) => {
                const mediaDiv = document.createElement('div');
                mediaDiv.className = 'media-item';
                
                if (media.type === 'image') {
                    mediaDiv.innerHTML = \`
                        <img src="\${media.url}" alt="\${media.name}">
                        <button class="remove-btn" onclick="removeMedia(\${index})">&times;</button>
                        \${index === 0 ? '<div class="thumbnail-indicator">缩略图</div>' : ''}
                    \`;
                } else {
                    mediaDiv.innerHTML = \`
                        <video src="\${media.url}" muted></video>
                        <button class="remove-btn" onclick="removeMedia(\${index})">&times;</button>
                        \${index === 0 ? '<div class="thumbnail-indicator">缩略图</div>' : ''}
                    \`;
                }
                
                preview.appendChild(mediaDiv);
            });
        }
        
        // 移除媒体
        function removeMedia(index) {
            selectedMedia.splice(index, 1);
            updateMediaPreview();
        }
        
        // 保存产品
        async function saveProduct() {
            const productId = document.getElementById('productId').value;
            const nameZh = document.getElementById('productNameZh').value;
            const nameEn = document.getElementById('productNameEn').value;
            const descZh = document.getElementById('productDescZh').value;
            const descEn = document.getElementById('productDescEn').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const categoryId = parseInt(document.getElementById('productCategory').value);
            const featured = document.getElementById('productFeatured').checked;
            
            if (!nameEn || !price || !categoryId) {
                alert('请填写必要信息：英文名称、价格、分类');
                return;
            }
            
            try {
                let result;
                
                if (productId) {
                    // 更新产品
                    result = await apiFetch(\`/api/products/\${productId}\`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            name: nameEn,
                            description: descEn,
                            price: price,
                            categoryId: categoryId,
                            featured: featured
                        })
                    });
                } else {
                    // 创建产品
                    result = await apiFetch('/api/products', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: nameEn,
                            description: descEn,
                            price: price,
                            categoryId: categoryId,
                            featured: featured,
                            lang: 'en'
                        })
                    });
                }
                
                // TODO: 处理媒体上传
                // TODO: 处理中文翻译
                
                alert(\`产品\${productId ? '更新' : '创建'}成功\`);
                closeProductModal();
                loadProductsData(); // 重新加载产品数据
            } catch (error) {
                alert(\`产品\${productId ? '更新' : '创建'}失败: \${error.message}\`);
            }
        }
        
        // 删除产品
        async function deleteProduct(productId) {
            if (!confirm('确定要删除这个产品吗？')) {
                return;
            }
            
            try {
                await apiFetch(\`/api/products/\${productId}\`, {
                    method: 'DELETE'
                });
                
                alert('产品删除成功');
                loadProductsData(); // 重新加载产品数据
            } catch (error) {
                alert('删除产品失败: ' + error.message);
            }
        }
        
        // 全局函数暴露
        window.viewUser = viewUser;
        window.closeUserModal = closeUserModal;
        window.saveUserChanges = saveUserChanges;
        window.resetUserPassword = resetUserPassword;
        window.showCreateProductModal = showCreateProductModal;
        window.editProduct = editProduct;
        window.closeProductModal = closeProductModal;
        window.handleMediaUpload = handleMediaUpload;
        window.removeMedia = removeMedia;
        window.saveProduct = saveProduct;
        window.deleteProduct = deleteProduct;
        // 新增的仪表板功能
        window.refreshDashboard = refreshDashboard;
        window.exportData = exportData;
        // 日志管理功能
        window.cleanupLogs = cleanupLogs;
    </script>
</body>
</html>`;
    return c.html(adminDashboardHtml);
});

// 静态文件服务 - API文档
app.get('/api/docs', (c) => {
    const swaggerUI = `
<!DOCTYPE html>
<html>
<head>
    <title>Tao Ecommerce API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
    return c.html(swaggerUI);
});

// OpenAPI JSON 文档
app.get('/openapi.json', async (c) => {
    try {
        // 读取openapi.json文件内容
        const openApiSpec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Tao Ecommerce API",
                "version": "1.0.0",
                "description": "API for Tao Ecommerce application"
            },
            "servers": [
                {
                    "url": "/api",
                    "description": "API Server"
                }
            ],
            "components": {
                "securitySchemes": {
                    "BearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                },
                "schemas": {
                    "Product": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "name": { "type": "string" },
                            "description": { "type": "string" },
                            "price": { "type": "number" },
                            "categoryId": { "type": "integer" },
                            "categoryName": { "type": "string" },
                            "featured": { "type": "boolean" },
                            "media": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "integer" },
                                        "url": { "type": "string" },
                                        "mediaType": { "type": "string", "enum": ["image", "video"] }
                                    }
                                }
                            }
                        }
                    },
                    "Category": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "name": { "type": "string" }
                        }
                    },
                    "User": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "email": { "type": "string" }
                        }
                    },
                    "Cart": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "userId": { "type": "integer" },
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "integer" },
                                        "productId": { "type": "integer" },
                                        "quantity": { "type": "integer" },
                                        "product": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            }
                        }
                    },
                    "UserProfile": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "userId": { "type": "integer" },
                            "firstName": { "type": "string" },
                            "lastName": { "type": "string" },
                            "phone": { "type": "string" },
                            "gender": { "type": "string", "enum": ["male", "female", "other"] },
                            "dateOfBirth": { "type": "string", "format": "date" },
                            "avatar": { "type": "string" },
                            "createdAt": { "type": "string", "format": "date-time" },
                            "updatedAt": { "type": "string", "format": "date-time" }
                        }
                    },
                    "UserAddress": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "userId": { "type": "integer" },
                            "title": { "type": "string" },
                            "recipientName": { "type": "string" },
                            "recipientPhone": { "type": "string" },
                            "country": { "type": "string" },
                            "province": { "type": "string" },
                            "city": { "type": "string" },
                            "district": { "type": "string" },
                            "streetAddress": { "type": "string" },
                            "postalCode": { "type": "string" },
                            "isDefault": { "type": "boolean" },
                            "createdAt": { "type": "string", "format": "date-time" },
                            "updatedAt": { "type": "string", "format": "date-time" }
                        },
                        "required": ["title", "recipientName", "recipientPhone", "country", "province", "city", "streetAddress"]
                    },
                    "Order": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "userId": { "type": "integer" },
                            "totalAmount": { "type": "number" },
                            "status": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled"] },
                            "shippingRecipientName": { "type": "string" },
                            "shippingRecipientPhone": { "type": "string" },
                            "shippingCountry": { "type": "string" },
                            "shippingProvince": { "type": "string" },
                            "shippingCity": { "type": "string" },
                            "shippingDistrict": { "type": "string" },
                            "shippingStreetAddress": { "type": "string" },
                            "shippingPostalCode": { "type": "string" },
                            "createdAt": { "type": "string", "format": "date-time" },
                            "updatedAt": { "type": "string", "format": "date-time" },
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": { "type": "integer" },
                                        "productId": { "type": "integer" },
                                        "quantity": { "type": "integer" },
                                        "pricePerItem": { "type": "number" },
                                        "product": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            }
                        }
                    },
                    "AdminUser": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "email": { "type": "string" },
                            "role": { "type": "string", "enum": ["user", "admin", "super_admin", "moderator"] },
                            "status": { "type": "string", "enum": ["active", "disabled", "suspended", "deleted"] },
                            "createdAt": { "type": "string", "format": "date-time" },
                            "lastLoginAt": { "type": "string", "format": "date-time" }
                        }
                    },
                    "AdminLog": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "adminId": { "type": "integer" },
                            "action": { "type": "string" },
                            "targetType": { "type": "string" },
                            "targetId": { "type": "integer" },
                            "details": { "type": "string" },
                            "ipAddress": { "type": "string" },
                            "userAgent": { "type": "string" },
                            "createdAt": { "type": "string", "format": "date-time" },
                            "admin": { "$ref": "#/components/schemas/AdminUser" }
                        }
                    },
                    "DashboardStats": {
                        "type": "object",
                        "properties": {
                            "totalUsers": { "type": "integer" },
                            "totalOrders": { "type": "integer" },
                            "totalProducts": { "type": "integer" },
                            "newUsersThisMonth": { "type": "integer" },
                            "orderStatusStats": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "status": { "type": "string" },
                                        "count": { "type": "integer" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "paths": {
                "/products": {
                    "get": {
                        "summary": "Get all products",
                        "parameters": [
                            {
                                "name": "lang",
                                "in": "query",
                                "description": "Language code (en/zh)",
                                "schema": { "type": "string", "default": "en" }
                            },
                            {
                                "name": "categoryId",
                                "in": "query",
                                "description": "Filter by category ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "List of products",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": { "$ref": "#/components/schemas/Product" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "post": {
                        "summary": "Create a new product",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["name", "description", "price"],
                                        "properties": {
                                            "name": { "type": "string" },
                                            "description": { "type": "string" },
                                            "price": { "type": "number" },
                                            "categoryId": { "type": "integer" },
                                            "featured": { "type": "boolean", "default": false },
                                            "lang": { "type": "string", "default": "en" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": {
                                "description": "Product created",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input" },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/products/categories": {
                    "get": {
                        "summary": "Get all product categories",
                        "parameters": [
                            {
                                "name": "lang",
                                "in": "query",
                                "description": "Language code (en/zh)",
                                "schema": { "type": "string", "default": "en" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "List of categories",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "array",
                                            "items": { "$ref": "#/components/schemas/Category" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/products/{id}": {
                    "get": {
                        "summary": "Get product by ID",
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            },
                            {
                                "name": "lang",
                                "in": "query",
                                "description": "Language code (en/zh)",
                                "schema": { "type": "string", "default": "en" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Product details",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "404": { "description": "Product not found" }
                        }
                    },
                    "patch": {
                        "summary": "Update product",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "name": { "type": "string" },
                                            "description": { "type": "string" },
                                            "price": { "type": "number" },
                                            "categoryId": { "type": "integer" },
                                            "featured": { "type": "boolean" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Product updated",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Product not found" }
                        }
                    }
                },
                "/auth/register": {
                    "post": {
                        "summary": "Register a new user",
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["email", "password"],
                                        "properties": {
                                            "email": { "type": "string", "format": "email" },
                                            "password": { "type": "string", "minLength": 8 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": { "description": "User registered successfully" },
                            "400": { "description": "Invalid input" },
                            "409": { "description": "User already exists" }
                        }
                    }
                },
                "/auth/login": {
                    "post": {
                        "summary": "Login user",
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["email", "password"],
                                        "properties": {
                                            "email": { "type": "string", "format": "email" },
                                            "password": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Login successful",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "token": { "type": "string" },
                                                "user": {
                                                    "type": "object",
                                                    "properties": {
                                                        "id": { "type": "integer" },
                                                        "email": { "type": "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Invalid credentials" }
                        }
                    }
                },
                "/cart": {
                    "get": {
                        "summary": "Get user cart",
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "User cart",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Cart" }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/cart/items": {
                    "post": {
                        "summary": "Add item to cart",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["productId"],
                                        "properties": {
                                            "productId": { "type": "integer" },
                                            "quantity": { "type": "integer", "default": 1 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Item added to cart",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Cart" }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/cart/items/{itemId}": {
                    "put": {
                        "summary": "Update cart item quantity",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "itemId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["quantity"],
                                        "properties": {
                                            "quantity": { "type": "integer", "minimum": 1 }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": { "description": "Cart item updated" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Cart item not found" }
                        }
                    },
                    "delete": {
                        "summary": "Remove item from cart",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "itemId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": { "description": "Cart item removed" },
                            "401": { "description": "Unauthorized" },
                            "404": { "description": "Cart item not found" }
                        }
                    }
                },
                "/auth/me": {
                    "get": {
                        "summary": "Get current user profile",
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "User profile",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/User" }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/products/{id}/media": {
                    "post": {
                        "summary": "Upload media for product",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "multipart/form-data": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "image": {
                                                "type": "array",
                                                "items": { "type": "string", "format": "binary" }
                                            },
                                            "video": {
                                                "type": "array",
                                                "items": { "type": "string", "format": "binary" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": {
                                "description": "Media uploaded successfully",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input" },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/products/{productId}/media/{mediaLinkId}/set-thumbnail": {
                    "post": {
                        "summary": "Set product media as thumbnail",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "productId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            },
                            {
                                "name": "mediaLinkId",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Thumbnail set successfully",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/Product" }
                                    }
                                }
                            },
                            "400": { "description": "Invalid ID" },
                            "401": { "description": "Unauthorized" }
                        }
                    }
                },
                "/profile": {
                    "get": {
                        "summary": "Get user profile",
                        "description": "获取当前用户的详细资料信息",
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "User profile information",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "profile": { "$ref": "#/components/schemas/UserProfile" }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized - 需要认证" },
                            "404": { "description": "Profile not found" }
                        }
                    },
                    "put": {
                        "summary": "Update user profile",
                        "description": "更新用户资料信息",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "firstName": { "type": "string" },
                                            "lastName": { "type": "string" },
                                            "phone": { "type": "string" },
                                            "gender": { "type": "string", "enum": ["male", "female", "other"] },
                                            "dateOfBirth": { "type": "string", "format": "date" },
                                            "avatar": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Profile updated successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "profile": { "$ref": "#/components/schemas/UserProfile" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input data" },
                            "401": { "description": "Unauthorized - 需要认证" }
                        }
                    }
                },
                "/addresses": {
                    "get": {
                        "summary": "Get user addresses",
                        "description": "获取用户的所有收货地址",
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "List of user addresses",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "addresses": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/UserAddress" }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized - 需要认证" }
                        }
                    },
                    "post": {
                        "summary": "Create new address",
                        "description": "创建新的收货地址",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["title", "recipientName", "recipientPhone", "country", "province", "city", "streetAddress"],
                                        "properties": {
                                            "title": { "type": "string", "description": "地址标题，如'家'、'公司'" },
                                            "recipientName": { "type": "string", "description": "收件人姓名" },
                                            "recipientPhone": { "type": "string", "description": "收件人电话" },
                                            "country": { "type": "string", "description": "国家" },
                                            "province": { "type": "string", "description": "省份" },
                                            "city": { "type": "string", "description": "城市" },
                                            "district": { "type": "string", "description": "区/县" },
                                            "streetAddress": { "type": "string", "description": "详细地址" },
                                            "postalCode": { "type": "string", "description": "邮政编码" },
                                            "isDefault": { "type": "boolean", "description": "是否为默认地址" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "201": {
                                "description": "Address created successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "address": { "$ref": "#/components/schemas/UserAddress" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input data" },
                            "401": { "description": "Unauthorized - 需要认证" }
                        }
                    }
                },
                "/addresses/{id}": {
                    "put": {
                        "summary": "Update address",
                        "description": "更新指定的收货地址",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" },
                                "description": "地址ID"
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "title": { "type": "string" },
                                            "recipientName": { "type": "string" },
                                            "recipientPhone": { "type": "string" },
                                            "country": { "type": "string" },
                                            "province": { "type": "string" },
                                            "city": { "type": "string" },
                                            "district": { "type": "string" },
                                            "streetAddress": { "type": "string" },
                                            "postalCode": { "type": "string" },
                                            "isDefault": { "type": "boolean" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Address updated successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "address": { "$ref": "#/components/schemas/UserAddress" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input data" },
                            "401": { "description": "Unauthorized - 需要认证" },
                            "404": { "description": "Address not found" }
                        }
                    },
                    "delete": {
                        "summary": "Delete address",
                        "description": "删除指定的收货地址",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "schema": { "type": "integer" },
                                "description": "地址ID"
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "Address deleted successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "message": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized - 需要认证" },
                            "404": { "description": "Address not found" }
                        }
                    }
                },
                "/orders": {
                    "get": {
                        "summary": "Get user orders",
                        "description": "获取用户的订单列表，支持按状态筛选",
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "status",
                                "in": "query",
                                "description": "订单状态筛选：active(进行中), completed(已完成), all(全部)",
                                "schema": { "type": "string", "enum": ["active", "completed", "all"] }
                            },
                            {
                                "name": "page",
                                "in": "query",
                                "description": "页码",
                                "schema": { "type": "integer", "default": 1 }
                            },
                            {
                                "name": "limit",
                                "in": "query",
                                "description": "每页数量",
                                "schema": { "type": "integer", "default": 10 }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "User orders list",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "orders": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/Order" }
                                                },
                                                "pagination": {
                                                    "type": "object",
                                                    "properties": {
                                                        "page": { "type": "integer" },
                                                        "limit": { "type": "integer" },
                                                        "total": { "type": "integer" },
                                                        "totalPages": { "type": "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "Unauthorized - 需要认证" }
                        }
                    }
                },
                "/change-password": {
                    "put": {
                        "summary": "Change user password",
                        "description": "修改用户密码",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["currentPassword", "newPassword"],
                                        "properties": {
                                            "currentPassword": { "type": "string", "description": "当前密码" },
                                            "newPassword": { "type": "string", "minLength": 8, "description": "新密码，至少8位" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Password changed successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "message": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "Invalid input data or current password incorrect" },
                            "401": { "description": "Unauthorized - 需要认证" }
                        }
                    }
                },
                "/profile/delete-account": {
                    "delete": {
                        "summary": "Delete user account",
                        "description": "删除用户账户，此操作不可撤销，将删除用户所有相关数据",
                        "security": [{ "BearerAuth": [] }],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["password"],
                                        "properties": {
                                            "password": { "type": "string", "description": "当前密码用于验证身份" }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "Account deleted successfully",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "message": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "Password is required or incorrect" },
                            "401": { "description": "Unauthorized - 需要认证" },
                            "404": { "description": "User not found" }
                        }
                    }
                },
                "/admin/users": {
                    "get": {
                        "summary": "获取用户列表",
                        "description": "管理员获取用户列表，支持分页、搜索和状态筛选",
                        "tags": ["Admin - User Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "page",
                                "in": "query",
                                "description": "页码",
                                "schema": { "type": "integer", "default": 1 }
                            },
                            {
                                "name": "limit",
                                "in": "query",
                                "description": "每页数量",
                                "schema": { "type": "integer", "default": 20 }
                            },
                            {
                                "name": "search",
                                "in": "query",
                                "description": "搜索邮箱",
                                "schema": { "type": "string" }
                            },
                            {
                                "name": "status",
                                "in": "query",
                                "description": "用户状态筛选",
                                "schema": { "type": "string", "enum": ["active", "disabled", "suspended", "deleted"] }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "用户列表",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "users": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/AdminUser" }
                                                },
                                                "pagination": {
                                                    "type": "object",
                                                    "properties": {
                                                        "page": { "type": "integer" },
                                                        "limit": { "type": "integer" },
                                                        "total": { "type": "integer" },
                                                        "totalPages": { "type": "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" }
                        }
                    }
                },
                "/admin/users/{id}": {
                    "get": {
                        "summary": "获取用户详情",
                        "description": "管理员获取指定用户的详细信息",
                        "tags": ["Admin - User Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "description": "用户ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "用户详情",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "id": { "type": "integer" },
                                                "email": { "type": "string" },
                                                "role": { "type": "string" },
                                                "status": { "type": "string" },
                                                "profile": { "$ref": "#/components/schemas/UserProfile" },
                                                "addresses": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/UserAddress" }
                                                },
                                                "orders": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/Order" }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" },
                            "404": { "description": "用户不存在" }
                        }
                    },
                    "delete": {
                        "summary": "删除用户",
                        "description": "超级管理员软删除指定用户（不可删除管理员账户）",
                        "tags": ["Admin - User Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "description": "用户ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "用户删除成功",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "message": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足（需要超级管理员权限）" },
                            "404": { "description": "用户不存在" }
                        }
                    }
                },
                "/admin/users/{id}/status": {
                    "put": {
                        "summary": "修改用户状态",
                        "description": "管理员修改指定用户的状态",
                        "tags": ["Admin - User Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "description": "用户ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["status"],
                                        "properties": {
                                            "status": {
                                                "type": "string",
                                                "enum": ["active", "disabled", "suspended"],
                                                "description": "新的用户状态"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "状态修改成功",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "user": { "$ref": "#/components/schemas/AdminUser" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "无效的状态值" },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" },
                            "404": { "description": "用户不存在" }
                        }
                    }
                },
                "/admin/users/{id}/reset-password": {
                    "post": {
                        "summary": "重置用户密码",
                        "description": "管理员重置指定用户的密码为随机临时密码",
                        "tags": ["Admin - User Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "description": "用户ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "密码重置成功",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "message": { "type": "string" },
                                                "tempPassword": { "type": "string" },
                                                "email": { "type": "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" },
                            "404": { "description": "用户不存在" }
                        }
                    }
                },
                "/admin/orders": {
                    "get": {
                        "summary": "获取订单列表",
                        "description": "管理员获取订单列表，支持多种筛选条件",
                        "tags": ["Admin - Order Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "page",
                                "in": "query",
                                "description": "页码",
                                "schema": { "type": "integer", "default": 1 }
                            },
                            {
                                "name": "limit",
                                "in": "query",
                                "description": "每页数量",
                                "schema": { "type": "integer", "default": 20 }
                            },
                            {
                                "name": "status",
                                "in": "query",
                                "description": "订单状态筛选",
                                "schema": { "type": "string", "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] }
                            },
                            {
                                "name": "userId",
                                "in": "query",
                                "description": "用户ID筛选",
                                "schema": { "type": "integer" }
                            },
                            {
                                "name": "startDate",
                                "in": "query",
                                "description": "开始日期",
                                "schema": { "type": "string", "format": "date" }
                            },
                            {
                                "name": "endDate",
                                "in": "query",
                                "description": "结束日期",
                                "schema": { "type": "string", "format": "date" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "订单列表",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "orders": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/Order" }
                                                },
                                                "pagination": {
                                                    "type": "object",
                                                    "properties": {
                                                        "page": { "type": "integer" },
                                                        "limit": { "type": "integer" },
                                                        "total": { "type": "integer" },
                                                        "totalPages": { "type": "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" }
                        }
                    }
                },
                "/admin/orders/{id}/status": {
                    "put": {
                        "summary": "修改订单状态",
                        "description": "管理员修改指定订单的状态",
                        "tags": ["Admin - Order Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": true,
                                "description": "订单ID",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "requestBody": {
                            "required": true,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["status"],
                                        "properties": {
                                            "status": {
                                                "type": "string",
                                                "enum": ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
                                                "description": "新的订单状态"
                                            },
                                            "reason": {
                                                "type": "string",
                                                "description": "状态变更原因"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "description": "订单状态修改成功",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "success": { "type": "boolean" },
                                                "order": { "$ref": "#/components/schemas/Order" }
                                            }
                                        }
                                    }
                                }
                            },
                            "400": { "description": "无效的订单状态" },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" },
                            "404": { "description": "订单不存在" }
                        }
                    }
                },
                "/admin/logs": {
                    "get": {
                        "summary": "获取管理员操作日志",
                        "description": "管理员查看操作审计日志",
                        "tags": ["Admin - System Management"],
                        "security": [{ "BearerAuth": [] }],
                        "parameters": [
                            {
                                "name": "page",
                                "in": "query",
                                "description": "页码",
                                "schema": { "type": "integer", "default": 1 }
                            },
                            {
                                "name": "limit",
                                "in": "query",
                                "description": "每页数量",
                                "schema": { "type": "integer", "default": 20 }
                            },
                            {
                                "name": "action",
                                "in": "query",
                                "description": "操作类型筛选",
                                "schema": { "type": "string" }
                            },
                            {
                                "name": "adminId",
                                "in": "query",
                                "description": "管理员ID筛选",
                                "schema": { "type": "integer" }
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "操作日志列表",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "logs": {
                                                    "type": "array",
                                                    "items": { "$ref": "#/components/schemas/AdminLog" }
                                                },
                                                "pagination": {
                                                    "type": "object",
                                                    "properties": {
                                                        "page": { "type": "integer" },
                                                        "limit": { "type": "integer" },
                                                        "total": { "type": "integer" },
                                                        "totalPages": { "type": "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" }
                        }
                    }
                },
                "/admin/dashboard": {
                    "get": {
                        "summary": "获取管理员仪表板数据",
                        "description": "管理员查看系统统计数据和概览信息",
                        "tags": ["Admin - System Management"],
                        "security": [{ "BearerAuth": [] }],
                        "responses": {
                            "200": {
                                "description": "仪表板统计数据",
                                "content": {
                                    "application/json": {
                                        "schema": { "$ref": "#/components/schemas/DashboardStats" }
                                    }
                                }
                            },
                            "401": { "description": "未认证" },
                            "403": { "description": "权限不足" }
                        }
                    }
                }
            }
        };
        
        return c.json(openApiSpec);
    } catch (error) {
        return c.json({ error: 'Failed to load API documentation' }, 500);
    }
});

app.get('/media/:key', async (c) => {
    const key = c.req.param('key');
    
    // Check image bucket first
    let object = await c.env.IMAGES_BUCKET.get(key);
    
    // If not found, check video bucket
    if (object === null) {
        object = await c.env.VIDEOS_BUCKET.get(key);
    }

    if (object === null) {
        return c.json({ error: 'Media not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
        headers,
    });
});

const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || 'a-very-secret-key';
    try {
        const decodedPayload = await verify(token, secret);
        c.set('userId', parseInt((decodedPayload as any).sub, 10));
        await next();
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};

// 管理员权限验证中间件
const adminMiddleware = async (c: any, next: any) => {
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ error: 'Authentication required' }, 401);
    }
    
    const db = drizzle(c.env.DB, { schema });
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, email: true, role: true, status: true }
    });
    
    if (!user || !['admin', 'super_admin', 'moderator'].includes(user.role)) {
        return c.json({ error: 'Admin access required' }, 403);
    }
    
    if (user.status !== 'active') {
        return c.json({ error: 'Account disabled' }, 403);
    }
    
    c.set('adminUser', user);
    
    // 记录管理员操作日志
    const action = `${c.req.method} ${c.req.path}`;
    await logAdminAction(db, user.id, action, c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'));
    
    await next();
};

// 超级管理员权限验证
const superAdminMiddleware = async (c: any, next: any) => {
    const adminUser = c.get('adminUser');
    if (!adminUser || adminUser.role !== 'super_admin') {
        return c.json({ error: 'Super admin access required' }, 403);
    }
    await next();
};

// 操作日志记录函数
async function logAdminAction(db: any, adminId: number, action: string, ipAddress?: string, userAgent?: string, targetType?: string, targetId?: number, details?: any) {
    try {
        await db.insert(schema.adminLogs).values({
            adminId,
            action,
            targetType: targetType || 'system',
            targetId: targetId || null,
            details: details ? JSON.stringify(details) : null,
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

app.get('/api/products', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    const categoryId = c.req.query('categoryId');
    
    let whereCondition;
    if (categoryId && !isNaN(Number(categoryId))) {
        whereCondition = eq(products.categoryId, Number(categoryId));
    }
    
    const results = await db.query.products.findMany({ 
        where: whereCondition,
        with: { 
            media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] }, 
            translations: { where: eq(productTranslations.language, lang) },
            category: {
                with: {
                    translations: { where: eq(categoryTranslations.language, lang) }
                }
            }
        } 
    });
    
    const formatted = results.map(p => ({ 
        ...p, 
        name: p.translations[0]?.name, 
        description: p.translations[0]?.description,
        categoryName: (p.category as any)?.translations?.[0]?.name,
        price: p.price // 保持原始USD价格，前端将根据语言进行转换
    }));
    
    return c.json(formatted);
});

app.post('/api/products', authMiddleware, async (c) => {
    const body = await c.req.json();
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid data', issues: validation.error.issues }, 400);
    const { price, featured, categoryId, name, description, lang } = validation.data;
    
    const db = drizzle(c.env.DB, { schema });
    try {
        const newProductResult = await db.insert(products).values({ 
            price, 
            featured, 
            categoryId 
        }).returning({ insertedId: products.id });
        const newProductId = newProductResult[0]?.insertedId;
        if (!newProductId) throw new Error("Failed to create product.");
        await db.insert(productTranslations).values({ productId: newProductId, language: lang, name, description });
        const finalProduct = await db.query.products.findFirst({ where: eq(products.id, newProductId), with: { media: true, translations: true } });
        return c.json(finalProduct, 201);
    } catch (e: any) {
        return c.json({ error: 'Failed to create product', details: e.message }, 500);
    }
});

app.get('/api/products/categories', async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    
    const categoriesData = await db.query.categories.findMany({
        with: {
            translations: { where: eq(categoryTranslations.language, lang) }
        }
    });
    
    const formattedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.translations[0]?.name || 'Unknown Category'
    }));
    
    return c.json(formattedCategories);
});

app.get('/api/products/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    const lang = c.req.query('lang') || 'en';
    const db = drizzle(c.env.DB, { schema });
    
    const product = await db.query.products.findFirst({ 
        where: eq(products.id, id), 
        with: { 
            media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] }, 
            translations: { where: eq(productTranslations.language, lang) },
            category: {
                with: {
                    translations: { where: eq(categoryTranslations.language, lang) }
                }
            }
        } 
    });
    
    if (!product) return c.json({ error: 'Product not found' }, 404);
    
    const p = { 
        ...product, 
        name: product.translations[0]?.name, 
        description: product.translations[0]?.description,
        categoryName: (product.category as any)?.translations?.[0]?.name,
        price: product.price // 保持原始USD价格，前端将根据语言进行转换
    };
    
    return c.json(p);
});

app.patch('/api/products/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid product ID' }, 400);
    const lang = c.req.query('lang') || 'en';
    const body = await c.req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    const { price, featured, categoryId, name, description } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    try {
        const productUpdateData: any = {};
        if (price !== undefined) productUpdateData.price = price;
        if (featured !== undefined) productUpdateData.featured = featured;
        if (categoryId !== undefined) productUpdateData.categoryId = categoryId;
        if (Object.keys(productUpdateData).length > 0) {
            await db.update(products).set(productUpdateData).where(eq(products.id, id));
        }
        const translationUpdateData: any = {};
        if (name !== undefined) translationUpdateData.name = name;
        if (description !== undefined) translationUpdateData.description = description;
        if (Object.keys(translationUpdateData).length > 0) {
            const existing = await db.query.productTranslations.findFirst({ where: and(eq(productTranslations.productId, id), eq(productTranslations.language, lang)) });
            if (existing) {
                await db.update(productTranslations).set(translationUpdateData).where(eq(productTranslations.id, existing.id));
            } else {
                await db.insert(productTranslations).values({ productId: id, language: lang, name: name || '', description: description || '' });
            }
        }
        const updatedProduct = await db.query.products.findFirst({ where: eq(products.id, id), with: { media: true, translations: true } });
        return c.json(updatedProduct);
    } catch (e: any) {
        return c.json({ error: 'Failed to update product', details: e.message }, 500);
    }
});

app.post('/api/products/:productId/media/:mediaLinkId/set-thumbnail', authMiddleware, async (c) => {
    const productId = Number(c.req.param('productId'));
    const mediaLinkId = Number(c.req.param('mediaLinkId'));
    if (isNaN(productId) || isNaN(mediaLinkId)) {
        return c.json({ error: 'Invalid ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    try {
        // Set all media for this product to a higher displayOrder
        await db.update(productMedia)
            .set({ displayOrder: 1 })
            .where(eq(productMedia.productId, productId));

        // Set the selected media to be the thumbnail (displayOrder = 0)
        await db.update(productMedia)
            .set({ displayOrder: 0 })
            .where(and(eq(productMedia.id, mediaLinkId), eq(productMedia.productId, productId)));

        const updatedProduct = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] },
                translations: { where: eq(productTranslations.language, 'en') }
            }
        });

        return c.json(updatedProduct);
    } catch (e: any) {
        console.error('Failed to set thumbnail:', e);
        return c.json({ error: 'Failed to set thumbnail', details: e.message }, 500);
    }
});

app.post('/api/products/:id/media', authMiddleware, async (c) => {
    const productId = Number(c.req.param('id'));
    if (isNaN(productId)) {
        return c.json({ error: 'Invalid product ID' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });
    const formData = await c.req.formData();
    
    const imageFiles = formData.getAll('image');
    const videoFiles = formData.getAll('video');
    const files = [...imageFiles, ...videoFiles].filter(f => f && typeof f === 'object' && 'name' in f) as unknown as File[];

    if (files.length === 0) {
        return c.json({ error: 'No media files provided' }, 400);
    }

    for (const file of files) {
        const mediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (!mediaType) {
            console.warn(`Skipping unsupported file type: ${file.type}`);
            continue; 
        }

        const bucket = mediaType === 'image' ? c.env.IMAGES_BUCKET : c.env.VIDEOS_BUCKET;
        const fileBuffer = await file.arrayBuffer();
        const fileHash = await hash(fileBuffer);

        try {
            let asset = await db.query.mediaAssets.findFirst({
                where: eq(mediaAssets.hash, fileHash),
            });

            let assetId: number;

            if (asset) {
                assetId = asset.id;
            } else {
                const r2Key = generateUniqueFilename(file.name);
                await bucket.put(r2Key, fileBuffer);
                const url = `/media/${r2Key}`;

                const newAsset = await db.insert(mediaAssets).values({
                    hash: fileHash,
                    r2Key: r2Key,
                    size: file.size,
                    mediaType: mediaType,
                    url: url,
                }).returning({ id: mediaAssets.id });
                
                assetId = newAsset[0].id;
            }

            const lastMedia = await db.query.productMedia.findFirst({
                where: eq(productMedia.productId, productId),
                orderBy: [desc(productMedia.displayOrder)],
            });
            const displayOrder = lastMedia ? (lastMedia.displayOrder || 0) + 1 : 0;

            await db.insert(productMedia).values({
                productId: productId,
                assetId: assetId,
                displayOrder: displayOrder,
            }).returning();

        } catch (e: any) {
            console.error(`Failed to upload file ${file.name}:`, e);
            return c.json({ error: `Failed to process file ${file.name}`, details: e.message }, 500);
        }
    }
    
    const updatedProduct = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
            media: { with: { asset: true }, orderBy: [schema.productMedia.displayOrder] },
            translations: { where: eq(productTranslations.language, 'en') } 
        }
    });

    return c.json(updatedProduct, 201);
});

// Other routes like media, auth, cart etc. would follow

// 认证路由
app.post('/api/auth/register', async (c) => {
    const body = await c.req.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid registration data', issues: validation.error.issues }, 400);
    
    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否已存在
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (existingUser) return c.json({ error: 'User already exists' }, 409);
        
        // 创建新用户
        const hashedPassword = await hashPassword(password);
        const newUser = await db.insert(users).values({ email, password: hashedPassword }).returning({ id: users.id });
        
        return c.json({ message: 'User registered successfully' }, 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to register user', details: error.message }, 500);
    }
});

app.post('/api/auth/login', async (c) => {
    const body = await c.req.json();
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid login data', issues: validation.error.issues }, 400);
    
    const { email, password } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 查找用户
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) return c.json({ error: 'Invalid credentials' }, 401);
        
        // 验证密码
        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password) return c.json({ error: 'Invalid credentials' }, 401);
        
        // 生成JWT
        const secret = c.env.JWT_SECRET || 'a-very-secret-key';
        const payload = { sub: user.id.toString(), email: user.email, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) };
        const token = await sign(payload, secret);
        
        return c.json({ 
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Login failed', details: error.message }, 500);
    }
});

app.get('/api/auth/me', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, email: true }
    });

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
});

// 用户资料管理 API
app.get('/api/profile', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { id: true, email: true },
            with: {
                profile: true
            }
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        return c.json({
            id: user.id,
            email: user.email,
            profile: (user as any).profile
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get user profile', details: error.message }, 500);
    }
});

app.post('/api/profile', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validation = CreateUserProfileSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid profile data', issues: validation.error.issues }, 400);
    }
    
    const profileData = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否已有资料
        const existingProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        });
        
        if (existingProfile) {
            return c.json({ error: 'Profile already exists. Use PUT to update.' }, 409);
        }
        
        // 处理日期字符串转换
        const insertData: any = { userId, ...profileData };
        if (profileData.dateOfBirth) {
            insertData.dateOfBirth = new Date(profileData.dateOfBirth);
        }
        
        const result = await db.insert(userProfiles).values(insertData).returning();
        return c.json(result[0], 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create user profile', details: error.message }, 500);
    }
});

app.put('/api/profile', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validation = UpdateUserProfileSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid profile data', issues: validation.error.issues }, 400);
    }
    
    const profileData = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户资料是否存在
        const existingProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        });
        
        if (!existingProfile) {
            return c.json({ error: 'Profile not found. Use POST to create.' }, 404);
        }
        
        // 处理日期字符串转换
        const updateData: any = { ...profileData, updatedAt: new Date() };
        if (profileData.dateOfBirth) {
            updateData.dateOfBirth = new Date(profileData.dateOfBirth);
        }
        
        const result = await db.update(userProfiles)
            .set(updateData)
            .where(eq(userProfiles.userId, userId))
            .returning();
        
        return c.json(result[0]);
    } catch (error: any) {
        return c.json({ error: 'Failed to update user profile', details: error.message }, 500);
    }
});

// 密码修改API
app.put('/api/profile/change-password', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validation = ChangePasswordSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid password data', issues: validation.error.issues }, 400);
    }
    
    const { currentPassword, newPassword } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 获取当前用户信息
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 验证当前密码
        const currentPasswordHash = await hashPassword(currentPassword);
        if (currentPasswordHash !== user.password) {
            return c.json({ error: 'Current password is incorrect' }, 400);
        }
        
        // 加密新密码
        const newPasswordHash = await hashPassword(newPassword);
        
        // 更新密码
        await db.update(users)
            .set({ password: newPasswordHash })
            .where(eq(users.id, userId));
        
        return c.json({ message: 'Password changed successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to change password', details: error.message }, 500);
    }
});

// 删除账户API（账户注销）
app.delete('/api/profile/delete-account', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { password } = body;
    
    if (!password) {
        return c.json({ error: 'Password is required to delete account' }, 400);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 获取当前用户信息
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 验证密码
        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.password) {
            return c.json({ error: 'Password is incorrect' }, 400);
        }
        
        // 删除用户（由于设置了cascade，相关数据会自动删除）
        await db.delete(users).where(eq(users.id, userId));
        
        return c.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete account', details: error.message }, 500);
    }
});

// 用户地址管理 API
app.get('/api/addresses', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const addresses = await db.query.userAddresses.findMany({
            where: eq(userAddresses.userId, userId),
            orderBy: [desc(userAddresses.isDefault), desc(userAddresses.createdAt)]
        });
        
        return c.json(addresses);
    } catch (error: any) {
        return c.json({ error: 'Failed to get addresses', details: error.message }, 500);
    }
});

app.post('/api/addresses', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const validation = CreateAddressSchema.safeParse(body);
    
    if (!validation.success) {
        return c.json({ error: 'Invalid address data', issues: validation.error.issues }, 400);
    }
    
    const addressData = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 如果设置为默认地址，先将其他地址设为非默认
        if (addressData.isDefault) {
            await db.update(userAddresses)
                .set({ isDefault: false })
                .where(eq(userAddresses.userId, userId));
        }
        
        const result = await db.insert(userAddresses)
            .values({ userId, ...addressData })
            .returning();
        
        return c.json(result[0], 201);
    } catch (error: any) {
        return c.json({ error: 'Failed to create address', details: error.message }, 500);
    }
});

app.put('/api/addresses/:id', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const addressId = Number(c.req.param('id'));
    const body = await c.req.json();
    const validation = UpdateAddressSchema.safeParse(body);
    
    if (isNaN(addressId)) {
        return c.json({ error: 'Invalid address ID' }, 400);
    }
    
    if (!validation.success) {
        return c.json({ error: 'Invalid address data', issues: validation.error.issues }, 400);
    }
    
    const addressData = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证地址是否属于当前用户
        const existingAddress = await db.query.userAddresses.findFirst({
            where: and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId))
        });
        
        if (!existingAddress) {
            return c.json({ error: 'Address not found or unauthorized' }, 404);
        }
        
        // 如果设置为默认地址，先将其他地址设为非默认
        if (addressData.isDefault) {
            await db.update(userAddresses)
                .set({ isDefault: false })
                .where(eq(userAddresses.userId, userId));
        }
        
        const result = await db.update(userAddresses)
            .set({ ...addressData, updatedAt: new Date() })
            .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
            .returning();
        
        return c.json(result[0]);
    } catch (error: any) {
        return c.json({ error: 'Failed to update address', details: error.message }, 500);
    }
});

app.delete('/api/addresses/:id', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const addressId = Number(c.req.param('id'));
    
    if (isNaN(addressId)) {
        return c.json({ error: 'Invalid address ID' }, 400);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证地址是否属于当前用户
        const existingAddress = await db.query.userAddresses.findFirst({
            where: and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId))
        });
        
        if (!existingAddress) {
            return c.json({ error: 'Address not found or unauthorized' }, 404);
        }
        
        await db.delete(userAddresses)
            .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)));
        
        return c.json({ message: 'Address deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete address', details: error.message }, 500);
    }
});

app.post('/api/addresses/:id/set-default', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const addressId = Number(c.req.param('id'));
    
    if (isNaN(addressId)) {
        return c.json({ error: 'Invalid address ID' }, 400);
    }
    
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证地址是否属于当前用户
        const existingAddress = await db.query.userAddresses.findFirst({
            where: and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId))
        });
        
        if (!existingAddress) {
            return c.json({ error: 'Address not found or unauthorized' }, 404);
        }
        
        // 将所有地址设为非默认
        await db.update(userAddresses)
            .set({ isDefault: false })
            .where(eq(userAddresses.userId, userId));
        
        // 设置目标地址为默认
        const result = await db.update(userAddresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
            .returning();
        
        return c.json(result[0]);
    } catch (error: any) {
        return c.json({ error: 'Failed to set default address', details: error.message }, 500);
    }
});

// 用户订单管理 API
app.get('/api/orders', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    const status = c.req.query('status'); // 可选的状态过滤
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;
    const offset = (page - 1) * limit;
    
    try {
        let whereCondition = eq(orders.userId, userId);
        
        // 如果指定了状态过滤
        if (status && ['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            whereCondition = and(whereCondition, eq(orders.status, status as any)) as any;
        }
        
        // 查询订单列表
        const userOrders = await db.query.orders.findMany({
            where: whereCondition,
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                translations: { where: eq(productTranslations.language, lang) },
                                media: { 
                                    with: { asset: true },
                                    limit: 1, // 只获取第一张图片作为缩略图
                                    orderBy: [schema.productMedia.displayOrder]
                                }
                            }
                        }
                    }
                },
            },
            orderBy: [desc(orders.createdAt)],
            limit: limit,
            offset: offset
        });
        
        // 格式化订单数据
        const formattedOrders = userOrders.map(order => ({
            id: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            shippingAddress: {
                recipientName: order.shippingRecipientName,
                recipientPhone: order.shippingRecipientPhone,
                country: order.shippingCountry,
                province: order.shippingProvince,
                city: order.shippingCity,
                district: order.shippingDistrict,
                streetAddress: order.shippingStreetAddress,
                postalCode: order.shippingPostalCode
            },
            items: order.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                pricePerItem: item.pricePerItem,
                product: {
                    id: item.product.id,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    price: item.product.price,
                    thumbnail: item.product.media[0]?.asset?.url || null
                }
            }))
        }));
        
        // 查询总数量用于分页
        const totalCountResult = await db.select({ count: count() })
            .from(orders)
            .where(whereCondition);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get orders', details: error.message }, 500);
    }
});

app.get('/api/orders/:id', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const orderId = Number(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    
    if (isNaN(orderId)) {
        return c.json({ error: 'Invalid order ID' }, 400);
    }
    
    try {
        const order = await db.query.orders.findFirst({
            where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                translations: { where: eq(productTranslations.language, lang) },
                                media: { 
                                    with: { asset: true },
                                    orderBy: [schema.productMedia.displayOrder]
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (!order) {
            return c.json({ error: 'Order not found or unauthorized' }, 404);
        }
        
        // 格式化订单详情
        const formattedOrder = {
            id: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            shippingAddress: {
                recipientName: order.shippingRecipientName,
                recipientPhone: order.shippingRecipientPhone,
                country: order.shippingCountry,
                province: order.shippingProvince,
                city: order.shippingCity,
                district: order.shippingDistrict,
                streetAddress: order.shippingStreetAddress,
                postalCode: order.shippingPostalCode
            },
            items: order.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                pricePerItem: item.pricePerItem,
                subtotal: item.quantity * item.pricePerItem,
                product: {
                    id: item.product.id,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    price: item.product.price,
                    media: item.product.media.map((m: any) => ({
                        id: m.asset.id,
                        url: m.asset.url,
                        mediaType: m.asset.mediaType
                    }))
                }
            }))
        };
        
        return c.json(formattedOrder);
    } catch (error: any) {
        return c.json({ error: 'Failed to get order details', details: error.message }, 500);
    }
});

// 获取用户当前进行中的订单（非 cancelled 和 delivered 状态）
app.get('/api/orders/active', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });
    const lang = c.req.query('lang') || 'en';
    
    try {
        const activeOrdersCondition = and(
            eq(orders.userId, userId),
            // 进行中的订单：pending, paid, shipped
            or(
                eq(orders.status, 'pending'),
                eq(orders.status, 'paid'), 
                eq(orders.status, 'shipped')
            )
        );
        
        const activeOrders = await db.query.orders.findMany({
            where: activeOrdersCondition,
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                translations: { where: eq(productTranslations.language, lang) },
                                media: { 
                                    with: { asset: true },
                                    limit: 1,
                                    orderBy: [schema.productMedia.displayOrder]
                                }
                            }
                        }
                    }
                }
            },
            orderBy: [desc(orders.createdAt)]
        });
        
        const formattedOrders = activeOrders.map(order => ({
            id: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            itemCount: order.items.length,
            firstItem: order.items[0] ? {
                product: {
                    name: order.items[0].product.translations[0]?.name || 'Unknown Product',
                    thumbnail: order.items[0].product.media[0]?.asset?.url || null
                },
                quantity: order.items[0].quantity
            } : null
        }));
        
        return c.json(formattedOrders);
    } catch (error: any) {
        return c.json({ error: 'Failed to get active orders', details: error.message }, 500);
    }
});

// 购物车路由
app.get('/api/cart', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const lang = c.req.query('lang') || 'en';
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 查找或创建购物车
        let cart = await db.query.carts.findFirst({ 
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { where: eq(productTranslations.language, lang) }
                            }
                        }
                    }
                }
            }
        });
        
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId }).returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                items: [], 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        // 格式化产品数据
        if (cart && cart.items) {
            (cart as any).items = cart.items.map((item: any) => ({
                ...item,
                product: item.product ? {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    description: item.product.translations[0]?.description || '',
                    price: item.product.price // 保持原始USD价格，前端将根据语言进行转换
                } : null
            }));
        }
        
        return c.json(cart);
    } catch (error: any) {
        return c.json({ error: 'Failed to get cart', details: error.message }, 500);
    }
});

app.post('/api/cart/items', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const lang = c.req.query('lang') || 'en';
    const body = await c.req.json();
    const validation = AddToCartSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid cart item data', issues: validation.error.issues }, 400);
    
    const { productId, quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 确保购物车存在
        let cart: any = await db.query.carts.findFirst({ where: eq(carts.userId, userId) });
        if (!cart) {
            const newCart = await db.insert(carts).values({ userId }).returning({ id: carts.id });
            cart = { 
                id: newCart[0].id, 
                userId, 
                createdAt: new Date(), 
                updatedAt: new Date() 
            };
        }
        
        // 检查商品是否已在购物车中
        const existingItem = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
        });
        
        if (existingItem) {
            // 更新数量
            await db.update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            // 添加新商品
            await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
        }
        
        // 返回更新后的购物车
        const updatedCart = await db.query.carts.findFirst({ 
            where: eq(carts.id, cart.id),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                media: { with: { asset: true } },
                                translations: { where: eq(productTranslations.language, lang) }
                            }
                        }
                    }
                }
            }
        });
        
        // 格式化产品数据
        if (updatedCart && updatedCart.items) {
            (updatedCart as any).items = updatedCart.items.map((item: any) => ({
                ...item,
                product: item.product ? {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product',
                    description: item.product.translations[0]?.description || '',
                    price: item.product.price // 保持原始USD价格，前端将根据语言进行转换
                } : null
            }));
        }
        
        return c.json(updatedCart);
    } catch (error: any) {
        return c.json({ error: 'Failed to add item to cart', details: error.message }, 500);
    }
});

app.put('/api/cart/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const body = await c.req.json();
    const validation = UpdateCartSchema.safeParse(body);
    if (!validation.success) return c.json({ error: 'Invalid update data', issues: validation.error.issues }, 400);
    
    const { quantity } = validation.data;
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证用户权限并更新
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || (cartItem.cart as any).userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item updated successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to update cart item', details: error.message }, 500);
    }
});

app.delete('/api/cart/items/:itemId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const itemId = Number(c.req.param('itemId'));
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 验证用户权限并删除
        const cartItem = await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
            with: { cart: true }
        });
        
        if (!cartItem || (cartItem.cart as any).userId !== userId) {
            return c.json({ error: 'Cart item not found or unauthorized' }, 404);
        }
        
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        
        return c.json({ message: 'Cart item removed successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to remove cart item', details: error.message }, 500);
    }
});

// ==== 管理员系统 API ====

// 管理员用户管理 API
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (search) {
            whereConditions.push(eq(users.email, `%${search}%`));
        }
        
        if (status) {
            whereConditions.push(eq(users.status, status));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const userList = await db.query.users.findMany({
            where: whereClause,
            columns: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLoginAt: true
            },
            limit,
            offset,
            orderBy: [desc(users.createdAt)]
        });
        
        const totalCountResult = await db.select({ count: count() })
            .from(users)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            users: userList,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get users', details: error.message }, 500);
    }
});

// 获取用户详情
app.get('/api/admin/users/:id', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const db = drizzle(c.env.DB, { schema });
    
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                profile: true,
                addresses: true,
                orders: {
                    limit: 10,
                    orderBy: [desc(orders.createdAt)]
                }
            }
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        return c.json(user);
    } catch (error: any) {
        return c.json({ error: 'Failed to get user details', details: error.message }, 500);
    }
});

// 修改用户状态
app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const { status } = await c.req.json();
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (!['active', 'disabled', 'suspended'].includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }
    
    try {
        const updatedUser = await db.update(users)
            .set({ status, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        
        if ((updatedUser as any).length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'update_user_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { oldStatus: 'unknown', newStatus: status });
        
        return c.json({ success: true, user: (updatedUser as any)[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update user status', details: error.message }, 500);
    }
});

// 删除用户 (软删除)
app.delete('/api/admin/users/:id', authMiddleware, superAdminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否存在
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 防止删除管理员账户
        if (['admin', 'super_admin', 'moderator'].includes(user.role)) {
            return c.json({ error: 'Cannot delete admin accounts' }, 403);
        }
        
        // 软删除：将状态设为 deleted
        await db.update(users)
            .set({ status: 'deleted', updatedAt: new Date() })
            .where(eq(users.id, userId));
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'delete_user', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { email: user.email });
        
        return c.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return c.json({ error: 'Failed to delete user', details: error.message }, 500);
    }
});

// 重置用户密码
app.post('/api/admin/users/:id/reset-password', authMiddleware, adminMiddleware, async (c) => {
    const userId = Number(c.req.param('id'));
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 检查用户是否存在
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        
        // 生成临时密码（8位随机字符串）
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
        
        // 加密临时密码
        const hashedPassword = await hashPassword(tempPassword);
        
        // 更新用户密码
        const updateResult = await db.update(users)
            .set({ 
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
            
        if (!updateResult || updateResult.length === 0) {
            return c.json({ 
                error: 'Failed to update password - no rows affected',
                debug: { userId, tempPassword, hashedPassword }
            }, 500);
        }
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'reset_password', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'user', userId, { email: user.email });
        
        return c.json({ 
            success: true, 
            message: 'Password reset successfully',
            tempPassword: tempPassword,
            email: user.email
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to reset password', details: error.message }, 500);
    }
});

// 管理员订单管理 API
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const status = c.req.query('status') || '';
    const userId = c.req.query('userId') || '';
    const startDate = c.req.query('startDate') || '';
    const endDate = c.req.query('endDate') || '';
    const offset = (page - 1) * limit;
    
    try {
        let whereConditions = [];
        
        if (status) {
            whereConditions.push(eq(orders.status, status as any));
        }
        
        if (userId) {
            whereConditions.push(eq(orders.userId, Number(userId)));
        }
        
        if (startDate) {
            whereConditions.push(eq(orders.createdAt, new Date(startDate)));
        }
        
        if (endDate) {
            whereConditions.push(eq(orders.createdAt, new Date(endDate)));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const orderList = await db.query.orders.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: { id: true, email: true }
                },
                items: {
                    with: {
                        product: {
                            columns: { id: true, name: true, price: true },
                            with: {
                                translations: { where: eq(productTranslations.language, 'en') }
                            }
                        }
                    }
                }
            },
            limit,
            offset,
            orderBy: [desc(orders.createdAt)]
        });
        
        // 格式化订单数据，确保产品名称从翻译表获取
        const formattedOrders = orderList.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                product: {
                    ...item.product,
                    name: item.product.translations[0]?.name || 'Unknown Product'
                }
            }))
        }));
        
        const totalCountResult = await db.select({ count: count() })
            .from(orders)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            orders: formattedOrders,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get orders', details: error.message }, 500);
    }
});

// 修改订单状态
app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, async (c) => {
    const orderId = Number(c.req.param('id'));
    const { status, reason } = await c.req.json();
    const adminUser = c.get('adminUser');
    const db = drizzle(c.env.DB, { schema });
    
    if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }
    
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId)
        });
        
        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }
        
        const updatedOrder = await db.update(orders)
            .set({ status, updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning();
        
        // 记录操作日志
        await logAdminAction(db, adminUser.id, 'update_order_status', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'), 
            'order', orderId, { oldStatus: order.status, newStatus: status, reason });
        
        return c.json({ success: true, order: updatedOrder[0] });
    } catch (error: any) {
        return c.json({ error: 'Failed to update order status', details: error.message }, 500);
    }
});

// 获取管理员操作日志
app.get('/api/admin/logs', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;
    const action = c.req.query('action') || '';
    const adminId = c.req.query('adminId') || '';
    const offset = (page - 1) * limit;
    
    try {
        // 自动清理90天前的日志（简单的清理策略）
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        await db.delete(adminLogs)
            .where(lt(adminLogs.createdAt, ninetyDaysAgo));
        
        let whereConditions = [];
        
        if (action) {
            whereConditions.push(eq(adminLogs.action, action));
        }
        
        if (adminId) {
            whereConditions.push(eq(adminLogs.adminId, Number(adminId)));
        }
        
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
        
        const logList = await db.query.adminLogs.findMany({
            where: whereClause,
            with: {
                admin: {
                    columns: { id: true, email: true, role: true }
                }
            },
            limit,
            offset,
            orderBy: [desc(adminLogs.createdAt)]
        });
        
        const totalCountResult = await db.select({ count: count() })
            .from(adminLogs)
            .where(whereClause);
        const totalCount = totalCountResult[0]?.count || 0;
        
        return c.json({
            logs: logList,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get admin logs', details: error.message }, 500);
    }
});

// 手动清理操作日志（仅超级管理员）
app.delete('/api/admin/logs/cleanup', authMiddleware, superAdminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const daysToKeep = Number(c.req.query('days')) || 30; // 默认保留30天
    
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        // 获取将被删除的日志数量
        const countResult = await db.select({ count: count() })
            .from(adminLogs)
            .where(lt(adminLogs.createdAt, cutoffDate));
        const deleteCount = countResult[0]?.count || 0;
        
        // 执行删除
        await db.delete(adminLogs)
            .where(lt(adminLogs.createdAt, cutoffDate));
        
        // 记录清理操作
        const adminUser = c.get('adminUser');
        await logAdminAction(db, adminUser.id, 'cleanup_logs', 
            c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
            'admin_logs', undefined, { 
                daysToKeep, 
                cutoffDate: cutoffDate.toISOString(), 
                deletedCount: deleteCount 
            });
        
        return c.json({ 
            success: true, 
            message: '清理完成，删除了 ' + deleteCount + ' 条' + daysToKeep + '天前的日志记录',
            deletedCount: deleteCount,
            cutoffDate: cutoffDate.toISOString()
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to cleanup logs', details: error.message }, 500);
    }
});

// 管理员仪表板统计
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    
    try {
        // 获取基础统计数据
        const totalUsers = await db.select({ count: count() }).from(users);
        const totalOrders = await db.select({ count: count() }).from(orders);
        const totalProducts = await db.select({ count: count() }).from(products);
        
        // 获取本月新增用户
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const newUsersThisMonth = await db.select({ count: count() })
            .from(users)
            .where(eq(users.createdAt, thisMonth));
        
        // 获取订单状态分布
        const orderStatusStats = await db.select({
            status: orders.status,
            count: count()
        }).from(orders).groupBy(orders.status);
        
        return c.json({
            totalUsers: totalUsers[0]?.count || 0,
            totalOrders: totalOrders[0]?.count || 0,
            totalProducts: totalProducts[0]?.count || 0,
            newUsersThisMonth: newUsersThisMonth[0]?.count || 0,
            orderStatusStats
        });
    } catch (error: any) {
        return c.json({ error: 'Failed to get dashboard data', details: error.message }, 500);
    }
});

export default app;