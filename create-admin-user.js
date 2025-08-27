/**
 * 创建管理员用户脚本
 * 使用正确的密码哈希算法
 */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hashBuffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function createAdminUser() {
    // 管理员账户信息
    const adminEmail = 'admin@tao.com';
    const adminPassword = 'admin123';
    
    // 生成密码哈希
    const hashedPassword = await hashPassword(adminPassword);
    
    console.log('管理员账户信息:');
    console.log('邮箱:', adminEmail);
    console.log('密码:', adminPassword);
    console.log('哈希密码:', hashedPassword);
    
    // 生成SQL语句
    const sql = `
-- 删除现有的管理员账户（如果存在）
DELETE FROM users WHERE email = '${adminEmail}';

-- 创建新的管理员账户（使用哈希密码）
INSERT INTO users (email, password, role, status, created_at, updated_at) 
VALUES ('${adminEmail}', '${hashedPassword}', 'super_admin', 'active', ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)});
    `;
    
    console.log('\n执行以下SQL语句来创建管理员账户:');
    console.log(sql);
    
    return {
        email: adminEmail,
        password: adminPassword,
        hashedPassword: hashedPassword,
        sql: sql
    };
}

// 运行脚本
createAdminUser().then(result => {
    console.log('\n✅ 管理员账户创建脚本执行完成');
    console.log('请复制上面的SQL语句并在数据库中执行');
}).catch(error => {
    console.error('❌ 错误:', error);
});