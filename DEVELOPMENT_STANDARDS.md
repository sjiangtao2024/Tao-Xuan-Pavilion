# Tao电商平台开发规范

## 📋 目录
- [项目概述](#项目概述)
- [架构原则](#架构原则)
- [开发模式](#开发模式)
- [文件组织](#文件组织)
- [代码规范](#代码规范)
- [模块系统](#模块系统)
- [认证安全](#认证安全)
- [开发工具](#开发工具)
- [关键词指南](#关键词指南)

## 🎯 项目概述

**Tao电商平台**是基于Cloudflare免费套餐构建的电子商务平台，采用无服务器架构，利用Cloudflare Workers、D1、R2等服务实现高可用性、低成本的电商解决方案。

### 技术栈
- **前端**: HTML5, CSS3, JavaScript ES6+
- **后端**: Cloudflare Workers + Hono框架
- **数据库**: Cloudflare D1 (SQLite兼容)
- **存储**: Cloudflare R2 (零出口费用)
- **状态管理**: Cloudflare Durable Objects
- **队列**: Cloudflare Queues
- **支付**: Stripe API

## 🏗️ 架构原则

### 1. 静态页面架构
- ✅ **HTML/CSS/JS分离**: 各自独立文件，便于维护
- ✅ **TypeScript专注API**: 不内嵌HTML代码
- ✅ **Cloudflare Wrangler规范**: 遵循Workers最佳实践
- ✅ **边缘缓存优化**: 利用全球CDN提升性能

### 2. 关注点分离
```
Frontend (public/)     ←→     Backend (src/)
├── UI展示              ←→     ├── API路由
├── 用户交互             ←→     ├── 业务逻辑  
├── 状态管理             ←→     ├── 数据处理
└── 模块化功能           ←→     └── 认证授权
```

### 3. 成本优化
- 🎯 **零数据出口费用**: 利用Cloudflare免费资源
- 🎯 **自动扩展**: 按需计费，无服务器架构
- 🎯 **边缘部署**: 全球低延迟访问

## 📁 文件组织

### 标准项目结构
```
tao-ecommerce-app/
├── public/                    # 静态资源 (Wrangler自动服务)
│   ├── *.html                # 页面模板
│   ├── css/                  # 样式文件
│   │   ├── admin.css         # 管理界面样式
│   │   └── [feature].css     # 功能特定样式
│   ├── js/                   # 前端核心逻辑
│   │   ├── admin.js          # 管理界面主逻辑
│   │   └── [feature].js      # 功能特定逻辑
│   └── modules/              # 功能模块 (ES6导出)
│       ├── user-management.js
│       ├── product-management.js
│       └── [feature]-management.js
├── src/                      # Workers业务逻辑
│   ├── routes/              # API路由 (TypeScript)
│   │   ├── admin.ts         # 管理API
│   │   ├── auth.ts          # 认证API
│   │   └── [feature].ts     # 功能API
│   ├── services/            # 业务服务
│   ├── middleware/          # 中间件
│   │   ├── auth.ts          # 认证中间件
│   │   └── admin.ts         # 管理权限
│   ├── types/               # TypeScript类型
│   └── utils/               # 工具函数
├── migrations/              # 数据库迁移
└── wrangler.jsonc          # Cloudflare配置
```

### 路径映射规则
```
前端访问路径              →    实际文件位置
/admin.html              →    public/admin.html
/css/admin.css           →    public/css/admin.css
/js/admin.js             →    public/js/admin.js
/modules/xxx.js          →    public/modules/xxx.js
```

## 💻 开发模式

### 🎯 模式1: 新建管理页面
**关键词**: `"静态页面架构 + Cloudflare Wrangler规范 + 前端认证流程"`

**实现步骤**:
1. 创建 `public/[feature].html` - 页面结构
2. 创建 `public/css/[feature].css` - 样式定义
3. 创建 `public/js/[feature].js` - 页面逻辑
4. 创建 `public/modules/[feature]-management.js` - 功能模块
5. 更新 `src/services/[feature]-dashboard.ts` - 路由重定向
6. 添加认证检查和动态模块加载

### 🎯 模式2: 添加功能模块
**关键词**: `"ES6模块导出 + public/modules路径 + 动态模块加载"`

**实现步骤**:
1. 在 `public/modules/` 创建新模块
2. 使用ES6导出语法
3. 确保函数名导入导出匹配
4. 在主逻辑中添加动态导入
5. 避免重复导出

### 🎯 模式3: API路由开发
**关键词**: `"TypeScript API专用 + Hono框架 + 认证中间件"`

**实现步骤**:
1. 在 `src/routes/` 创建新路由
2. 使用Hono框架和TypeScript
3. 添加认证中间件保护
4. 不内嵌HTML代码
5. 返回JSON数据

### 🎯 模式4: 重构现有功能
**关键词**: `"架构重构 + 文件清理 + 路径统一"`

**实现步骤**:
1. 分析现有代码结构
2. 拆分HTML/CSS/JS
3. 清理重复文件
4. 统一模块路径
5. 验证功能完整性

## 📝 代码规范

### TypeScript规范
```typescript
// ✅ 正确: 简单重定向
export function generateAdminDashboard(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <script>window.location.href = '/admin.html';</script>
        </head>
        <body><p>正在跳转...</p></body>
        </html>
    `;
}

// ❌ 错误: 内嵌复杂HTML
export function generateAdminDashboard(): string {
    return `<div style="...大量HTML代码...">...</div>`;
}

// ❌ 错误: 模板字符串语法
'Authorization': `Bearer ${token}`  // 错误
'Authorization': 'Bearer ' + token  // 正确
```

### JavaScript模块规范
```javascript
// ✅ 正确: 清晰的导出
export {
    initializeUserManagementModule,
    viewUser,
    editUser,
    deleteUser
};

// ❌ 错误: 重复导出
export function initializeUserManagementModule() { }
export function initializeUserManagementModule() { } // 重复!

// ✅ 正确: 动态导入
const { viewUser } = await import('/modules/user-management.js');

// ❌ 错误: 路径不规范
import { viewUser } from '../src/modules/user-management.js';
```

### HTML/CSS规范
```html
<!-- ✅ 正确: 语义化HTML -->
<div class="admin-container">
    <header class="header">
        <nav class="nav-menu"></nav>
    </header>
    <main class="main-content"></main>
</div>

<!-- ✅ 正确: 外部样式引用 -->
<link rel="stylesheet" href="/css/admin.css">
<script src="/js/admin.js" type="module"></script>
```

## 🔧 模块系统

### ES6模块导入支持
Cloudflare Wrangler **完全支持**ES6模块系统:

| 特性 | 支持 | 示例 |
|------|------|------|
| 静态导入导出 | ✅ | `export { func }; import { func } from '/modules/xxx.js';` |
| 动态导入 | ✅ | `const { func } = await import('/modules/xxx.js');` |
| 默认导出 | ✅ | `export default class; import Class from '/modules/xxx.js';` |
| 命名导出 | ✅ | `export function func() {}` |

### 模块最佳实践
```javascript
// 模块定义 (public/modules/example.js)
class ExampleManager {
    constructor() {
        this.initialized = false;
    }
    
    initialize() {
        if (this.initialized) return;
        console.log('Example模块初始化');
        this.initialized = true;
    }
    
    performAction(data) {
        // 功能实现
    }
}

// 统一导出
const exampleManager = new ExampleManager();

export {
    exampleManager as default,
    ExampleManager
};

export function initializeExampleModule() {
    exampleManager.initialize();
}

// 模块使用 (public/js/admin.js)
async function loadModules() {
    const { initializeExampleModule } = await import('/modules/example.js');
    initializeExampleModule();
}
```

## 🔐 认证安全

### 前端认证流程
```javascript
class AdminDashboard {
    async checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) return false;
        
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            return response.ok;
        } catch (error) {
            localStorage.removeItem('adminToken');
            return false;
        }
    }
    
    async init() {
        const isAuthenticated = await this.checkAuth();
        if (isAuthenticated) {
            this.showAdminInterface();
            await this.loadModules(); // 认证后才加载模块
        } else {
            this.showLoginInterface();
        }
    }
}
```

### 后端认证中间件
```typescript
// src/middleware/auth.ts
export const requireAuth = async (c: Context, next: Next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return c.json({ error: '未授权访问' }, 401);
    }
    // 验证token逻辑
    await next();
};
```

## 🛠️ 开发工具

### 必需工具
- **Node.js** (推荐LTS版本)
- **Wrangler CLI** (`npm install -g wrangler`)
- **Cloudflare账户**
- **Git** (版本控制)

### 开发命令
```bash
# 本地开发
wrangler dev

# 构建项目
npm run build

# 部署到生产
wrangler deploy

# 数据库迁移
wrangler d1 migrations apply DB --local  # 本地
wrangler d1 migrations apply DB          # 生产
```

### Windows PowerShell特殊说明
```powershell
# ✅ 正确: 使用分号分隔
cd "c:\dev_code\tao\tao-ecommerce-app"; wrangler dev

# ❌ 错误: 不要使用&&
cd "c:\dev_code\tao\tao-ecommerce-app" && wrangler dev
```

## 🔑 关键词指南

### 开发指导关键词
当需要开发新功能时，使用以下关键词组合：

#### 🎯 **新页面开发**
```
"静态页面架构 + Cloudflare Wrangler规范 + HTML/CSS/JS分离 + 前端认证流程"
```

#### 🎯 **功能模块开发**
```
"ES6模块导出 + public/modules路径 + 动态模块加载 + 避免重复导出"
```

#### 🎯 **API开发**
```
"TypeScript API专用 + Hono框架 + 认证中间件 + 不内嵌HTML"
```

#### 🎯 **架构重构**
```
"架构重构 + 文件清理 + 路径统一 + ES6模块兼容性"
```

### 问题排查关键词
```
"模块导入路径检查 + 重复导出排查 + 认证流程验证 + Wrangler配置检查"
```

## 📚 参考资源

### 官方文档
- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)
- [Hono框架文档](https://hono.dev/)

### 项目文档
- `ADMIN_SYSTEM_PLAN.md` - 管理系统规划
- `NAVIGATION_FEATURE.md` - 导航功能文档
- `USER_PROFILE_VERIFICATION.md` - 用户验证文档

---

## 🎉 总结

遵循本开发规范，您可以：
- ✅ 构建符合Cloudflare Workers最佳实践的应用
- ✅ 实现高性能、低成本的电商平台
- ✅ 保持代码的可维护性和可扩展性
- ✅ 确保团队开发的一致性

**记住核心原则**: 静态页面架构 + ES6模块系统 + 认证安全 + Cloudflare Wrangler规范

---
*最后更新: 2025-08-27*
*版本: 1.0.0*