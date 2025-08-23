-- Migration number: 0013 	 2025-08-23T09:17:09.006Z
-- 管理员系统数据库设置

-- 扩展 users 表添加管理员字段
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN last_login_at INTEGER;
ALTER TABLE users ADD COLUMN created_at INTEGER DEFAULT (strftime('%s', 'now'));
ALTER TABLE users ADD COLUMN updated_at INTEGER DEFAULT (strftime('%s', 'now'));
ALTER TABLE users ADD COLUMN created_by INTEGER;

-- 创建操作审计日志表
CREATE TABLE admin_logs (
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

-- 创建第一个超级管理员账户（密码: admin123，实际使用时应该使用更强的密码）
-- 注意：这里使用明文密码仅用于开发测试，生产环境应使用哈希密码
INSERT OR IGNORE INTO users (email, password, role, status, created_at, updated_at) 
VALUES ('admin@tao.com', 'admin123', 'super_admin', 'active', strftime('%s', 'now'), strftime('%s', 'now'));

-- 添加管理员日志索引以提高查询性能
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
