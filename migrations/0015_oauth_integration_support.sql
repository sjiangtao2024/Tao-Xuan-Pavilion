-- Migration number: 0015 	 2025-08-28T12:00:00.000Z
-- OAuth 集成支持

-- 扩展 users 表添加 OAuth 支持字段
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE; -- Google OAuth ID
ALTER TABLE users ADD COLUMN oauth_provider TEXT; -- OAuth 提供商 ('google', 'github', 'facebook', etc.)
ALTER TABLE users ADD COLUMN oauth_picture TEXT; -- OAuth 头像 URL
ALTER TABLE users ADD COLUMN auth_method TEXT DEFAULT 'email'; -- 认证方式 ('email', 'oauth')
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0; -- 邮箱是否已验证 (OAuth用户默认已验证)

-- 修改 password 字段，使其对于 OAuth 用户可为空
-- SQLite 不支持直接修改列，需要重建表
-- 先创建新表
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT, -- 改为可空，OAuth用户不需要密码
    google_id TEXT UNIQUE,
    oauth_provider TEXT,
    oauth_picture TEXT,
    auth_method TEXT DEFAULT 'email',
    email_verified INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin', 'moderator')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'suspended', 'deleted')),
    last_login_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users_new(id)
);

-- 复制现有数据
INSERT INTO users_new (
    id, email, password, role, status, last_login_at, created_at, updated_at, created_by
) SELECT 
    id, email, password, role, status, last_login_at, created_at, updated_at, created_by
FROM users;

-- 删除旧表并重命名新表
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- 重建索引
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_oauth_provider ON users(oauth_provider);
CREATE INDEX idx_users_auth_method ON users(auth_method);

-- 创建 OAuth 会话表，用于存储 OAuth 状态和 refresh token
CREATE TABLE oauth_sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'google', 'github', etc.
    provider_user_id TEXT NOT NULL, -- OAuth提供商的用户ID
    access_token TEXT, -- OAuth access token (可能会定期过期)
    refresh_token TEXT, -- OAuth refresh token (用于刷新access token)
    token_expires_at INTEGER, -- access token 过期时间
    scope TEXT, -- OAuth 权限范围
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(provider, provider_user_id)
);

-- 创建索引
CREATE INDEX idx_oauth_sessions_user_id ON oauth_sessions(user_id);
CREATE INDEX idx_oauth_sessions_provider ON oauth_sessions(provider);
CREATE INDEX idx_oauth_sessions_provider_user_id ON oauth_sessions(provider, provider_user_id);

-- 更新现有用户为邮箱认证方式
UPDATE users SET auth_method = 'email' WHERE auth_method IS NULL;
UPDATE users SET email_verified = 1 WHERE password IS NOT NULL; -- 假设现有邮箱用户已验证