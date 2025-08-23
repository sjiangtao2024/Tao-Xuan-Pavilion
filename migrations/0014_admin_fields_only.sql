-- Migration number: 0014 	 2025-08-23T09:18:23.697Z
-- 仅添加管理员系统需要的字段

-- 扩展 users 表添加管理员字段
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN last_login_at INTEGER;
ALTER TABLE users ADD COLUMN created_at INTEGER DEFAULT (strftime('%s', 'now'));
ALTER TABLE users ADD COLUMN updated_at INTEGER DEFAULT (strftime('%s', 'now'));
ALTER TABLE users ADD COLUMN created_by INTEGER;

-- 创建操作审计日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建第一个超级管理员账户
INSERT OR IGNORE INTO users (email, password, role, status, created_at, updated_at) 
VALUES ('admin@tao.com', 'admin123', 'super_admin', 'active', strftime('%s', 'now'), strftime('%s', 'now'));

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
