# Google OAuth 集成指南

本指南说明如何为 Tao 电商平台配置和使用 Google OAuth 认证。

## 1. Google OAuth 设置

### 1.1 在 Google Cloud Console 创建项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Identity 和 Access Management (IAM) API

### 1.2 配置 OAuth 2.0 客户端

1. 在 Google Cloud Console 中，导航到 **APIs & Services** > **Credentials**
2. 点击 **Create Credentials** > **OAuth 2.0 Client IDs**
3. 选择应用类型为 **Web application**
4. 配置授权的重定向 URI：
   - 开发环境：`http://127.0.0.1:8787`
   - 生产环境：`https://yourdomain.com`
5. 保存客户端 ID 和客户端密钥

### 1.3 配置授权域名

在 **OAuth consent screen** 中：
1. 添加你的域名到授权域名列表
2. 配置应用信息（名称、logo、隐私政策等）
3. 添加测试用户（如果应用还在测试阶段）

## 2. 后端配置

### 2.1 应用数据库迁移

```bash
# 应用 OAuth 支持的数据库迁移
npx wrangler d1 migrations apply ecommerce-db --local
```

### 2.2 环境变量配置

在 `wrangler.toml` 或通过 `wrangler secret` 设置：

```bash
# 设置 Google OAuth 客户端密钥（可选，用于服务器端验证）
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
```

## 3. 前端配置

### 3.1 启用 Google OAuth

在 `public/user/js/config.js` 中配置：

```javascript
window.APP_CONFIG = {
    // ... 其他配置
    
    // Google OAuth 配置
    GOOGLE_OAUTH: {
        CLIENT_ID: 'your-google-client-id.googleusercontent.com', // 替换为你的客户端ID
        ENABLED: true // 启用 Google OAuth
    }
};
```

### 3.2 自定义 Google 登录按钮

可以自定义 Google 登录按钮的样式：

```javascript
// 在应用初始化后
window.EventUtils.on('google-oauth-ready', () => {
    window.GoogleOAuth.renderSignInButton('custom-google-btn', {
        theme: 'filled_blue',    // 'outline', 'filled_blue', 'filled_black'
        size: 'large',           // 'large', 'medium', 'small'
        text: 'signin_with',     // 'signin_with', 'signup_with', 'continue_with'
        shape: 'rectangular',    // 'rectangular', 'pill', 'circle', 'square'
        logo_alignment: 'left'   // 'left', 'center'
    });
});
```

## 4. API 端点

### 4.1 Google OAuth 登录

**POST** `/api/auth/oauth/google`

请求体：
```json
{
    "googleToken": "google-jwt-token",
    "googleUser": {
        "id": "google-user-id",
        "email": "user@example.com",
        "name": "User Name",
        "picture": "https://avatar-url.com"
    }
}
```

响应：
```json
{
    "token": "jwt-token",
    "user": {
        "id": 123,
        "email": "user@example.com",
        "role": "user",
        "authMethod": "oauth",
        "oauthProvider": "google",
        "picture": "https://avatar-url.com",
        "emailVerified": true
    }
}
```

## 5. JWT Token 格式

### 5.1 OAuth 用户的 JWT Payload

```json
{
    "sub": "123",                    // 用户ID
    "email": "user@example.com",     // 邮箱
    "role": "user",                  // 用户角色
    "authMethod": "oauth",           // 认证方式
    "oauthProvider": "google",       // OAuth提供商
    "googleId": "google-user-id",    // Google用户ID
    "picture": "https://avatar.jpg", // 头像URL
    "emailVerified": true,           // 邮箱验证状态
    "iat": 1640995200,              // 签发时间
    "exp": 1641600000               // 过期时间
}
```

### 5.2 邮箱密码用户的 JWT Payload

```json
{
    "sub": "123",                    // 用户ID
    "email": "user@example.com",     // 邮箱
    "role": "user",                  // 用户角色
    "authMethod": "email",           // 认证方式
    "emailVerified": false,          // 邮箱验证状态
    "iat": 1640995200,              // 签发时间
    "exp": 1641600000               // 过期时间
}
```

## 6. 用户体验流程

### 6.1 首次登录用户

1. 用户点击 Google 登录按钮
2. 跳转到 Google 授权页面
3. 用户授权后，Google 返回用户信息
4. 前端发送用户信息到 `/api/auth/oauth/google`
5. 后端创建新用户账户并返回 JWT token
6. 前端保存 token 并更新用户状态

### 6.2 已存在邮箱的用户

1. 如果 Google 邮箱与现有账户邮箱相同
2. 后端会将现有账户升级为 OAuth 账户
3. 绑定 Google ID 并更新认证方式
4. 返回更新后的用户信息和新 token

### 6.3 已有 Google 账户的用户

1. 后端通过 Google ID 识别用户
2. 更新最后登录时间
3. 返回现有用户信息和新 token

## 7. 安全考虑

### 7.1 Token 验证

- 前端接收到的 Google JWT token 会发送到后端验证
- 后端生成自己的 JWT token，包含用户权限信息
- 支持 token 刷新机制

### 7.2 用户数据保护

- OAuth 用户的敏感信息（如 Google access token）存储在独立的 `oauth_sessions` 表中
- 支持撤销 OAuth 授权
- 用户可以在账户设置中管理连接的 OAuth 账户

## 8. 测试和调试

### 8.1 使用调试页面

访问 `/user/debug-auth.html` 来测试认证功能：
- 测试邮箱密码登录
- 测试 Google OAuth 登录
- 验证 token 有效性
- 查看本地存储状态

### 8.2 调试 Google OAuth

1. 检查浏览器控制台的 OAuth 相关日志
2. 验证 Google Client ID 配置正确
3. 确保域名在 Google OAuth 配置中已授权
4. 检查网络请求和响应

## 9. 常见问题

### 9.1 "未授权的域名" 错误

确保在 Google Cloud Console 中配置了正确的授权域名。

### 9.2 Token 验证失败

检查：
- JWT_SECRET 环境变量是否正确设置
- Token 是否已过期
- 用户状态是否为 active

### 9.3 OAuth 按钮不显示

检查：
- Google OAuth 是否已在配置中启用
- Google Client ID 是否正确配置
- Google Identity Services 脚本是否正确加载

## 10. 生产部署注意事项

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **域名配置**: 确保在 Google OAuth 设置中配置了正确的生产域名
3. **环境变量**: 确保所有必要的环境变量都已设置
4. **错误处理**: 实现适当的错误处理和用户反馈
5. **监控**: 设置适当的日志和监控来跟踪认证问题

通过以上配置，你的应用将支持邮箱密码和 Google OAuth 两种认证方式，提供更好的用户体验。