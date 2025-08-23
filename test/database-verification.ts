/**
 * 数据库迁移验证脚本
 * 用于验证用户资料功能的数据库表是否正确创建
 */

// 验证所需执行的SQL命令
export const verificationQueries = {
    // 检查 user_profiles 表结构
    checkUserProfilesTable: "PRAGMA table_info(user_profiles);",
    
    // 检查 user_addresses 表结构
    checkUserAddressesTable: "PRAGMA table_info(user_addresses);", 
    
    // 检查 orders 表结构（验证是否有新增字段）
    checkOrdersTable: "PRAGMA table_info(orders);",
    
    // 检查所有表
    listAllTables: "SELECT name FROM sqlite_master WHERE type='table';",
    
    // 检查已应用的迁移
    checkMigrations: "SELECT * FROM d1_migrations ORDER BY applied_at;",
    
    // 验证外键关系
    checkForeignKeys: "PRAGMA foreign_key_list(user_profiles);",
    checkAddressesForeignKeys: "PRAGMA foreign_key_list(user_addresses);"
};

// 期望的表结构
export const expectedTables = {
    user_profiles: [
        'id', 'user_id', 'first_name', 'last_name', 'phone', 
        'gender', 'date_of_birth', 'avatar', 'created_at', 'updated_at'
    ],
    user_addresses: [
        'id', 'user_id', 'title', 'recipient_name', 'recipient_phone',
        'country', 'province', 'city', 'district', 'street_address', 
        'postal_code', 'is_default', 'created_at', 'updated_at'
    ],
    orders_new_fields: [
        'shipping_recipient_name', 'shipping_recipient_phone', 'shipping_country',
        'shipping_province', 'shipping_city', 'shipping_district', 
        'shipping_street_address', 'shipping_postal_code', 'updated_at'
    ]
};

// 验证命令集合 - 可以直接在命令行中执行
export const verificationCommands = [
    // 检查迁移是否已应用
    'npx wrangler d1 migrations apply tao-ecommerce-app-db-local --local',
    
    // 验证用户资料表
    'npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="PRAGMA table_info(user_profiles);"',
    
    // 验证地址表
    'npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="PRAGMA table_info(user_addresses);"',
    
    // 验证订单表新字段
    'npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="PRAGMA table_info(orders);"',
    
    // 列出所有表
    'npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="SELECT name FROM sqlite_master WHERE type=\'table\';"',
    
    // 测试插入用户资料数据
    `npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="INSERT INTO user_profiles (user_id, first_name, last_name, created_at, updated_at) VALUES (1, '测试', '用户', 1629878400, 1629878400);"`,
    
    // 测试查询用户资料数据
    'npx wrangler d1 execute tao-ecommerce-app-db-local --local --command="SELECT * FROM user_profiles LIMIT 1;"',
];

// 功能测试用例
export const functionalTests = {
    // 测试API响应
    apiTests: [
        {
            name: '测试用户资料API',
            url: '/api/profile',
            method: 'GET',
            headers: { 'Authorization': 'Bearer test-token' },
            expectedStatus: 401 // 未认证时应返回401
        },
        {
            name: '测试地址API',
            url: '/api/addresses', 
            method: 'GET',
            headers: { 'Authorization': 'Bearer test-token' },
            expectedStatus: 401
        },
        {
            name: '测试订单API',
            url: '/api/orders',
            method: 'GET', 
            headers: { 'Authorization': 'Bearer test-token' },
            expectedStatus: 401
        }
    ],
    
    // 前端功能测试
    frontendTests: [
        {
            name: '用户资料页面加载',
            description: '访问 /profile 页面应该正常显示',
            steps: [
                '启动开发服务器: npm run dev',
                '打开浏览器访问: http://localhost:8787/profile',
                '验证页面包含左侧导航菜单',
                '验证包含个人信息、地址管理、订单管理、账户安全四个选项'
            ]
        },
        {
            name: '个人信息表单',
            description: '个人信息编辑表单应该正常工作',
            steps: [
                '点击"个人信息"导航',
                '验证表单包含姓名、电话、性别、生日字段',
                '尝试填写表单并提交',
                '验证数据保存成功'
            ]
        }
    ]
};

// 数据库清理脚本（测试后清理）
export const cleanupQueries = [
    "DELETE FROM user_profiles WHERE first_name = '测试';",
    "DELETE FROM user_addresses WHERE title LIKE '测试%';",
    "DELETE FROM orders WHERE shipping_recipient_name LIKE '测试%';"
];

console.log('数据库验证脚本已生成！');
console.log('请按以下步骤执行验证：');
console.log('1. 应用数据库迁移');
console.log('2. 验证表结构');
console.log('3. 运行单元测试');
console.log('4. 测试前端功能');
console.log('5. 清理测试数据');