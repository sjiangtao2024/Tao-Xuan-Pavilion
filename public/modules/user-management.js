/**
 * 用户管理模块 - 支持Cloudflare Workers环境
 * 提供用户详情查看、状态修改、密码重置等功能
 */

// 注入模块所需的CSS样式
function injectUserManagementStyles() {
    const existingStyle = document.getElementById('user-management-styles');
    if (existingStyle) return; // 避免重复注入
    
    const style = document.createElement('style');
    style.id = 'user-management-styles';
    style.textContent = `
        /* 用户管理模块样式 */
        .user-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }

        .user-modal-content {
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
            margin: 5% auto;
            padding: 25px;
            border: none;
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            color: #ffffff;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(243, 156, 18, 0.3);
        }

        .user-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(243, 156, 18, 0.3);
        }

        .user-modal-title {
            color: #f39c12;
            font-size: 1.5em;
            font-weight: bold;
            margin: 0;
        }

        .user-close {
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            background: none;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s;
        }

        .user-close:hover,
        .user-close:focus {
            color: #f39c12;
            background: rgba(243, 156, 18, 0.1);
        }

        .user-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .user-info-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #f39c12;
        }

        .user-info-label {
            font-weight: bold;
            color: #f39c12;
            margin-bottom: 8px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .user-info-value {
            font-size: 1.1em;
            color: #ffffff;
            word-break: break-word;
        }

        .user-status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-active {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
        }

        .status-disabled {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
        }

        .status-deleted {
            background: linear-gradient(135deg, #95a5a6, #7f8c8d);
            color: white;
        }
        
        .status-anonymized {
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
        }

        .user-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-action-btn {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95em;
            font-weight: 600;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 120px;
        }

        .user-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
        }

        .user-action-btn.danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
        }

        .user-action-btn.danger:hover {
            box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
        }

        .user-action-btn.warning {
            background: linear-gradient(135deg, #f39c12, #e67e22);
        }

        .user-action-btn.warning:hover {
            box-shadow: 0 8px 25px rgba(243, 156, 18, 0.3);
        }

        .user-action-btn.success {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
        }

        .user-action-btn.success:hover {
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
        }

        .user-action-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .user-action-btn:disabled:hover {
            transform: none;
            box-shadow: none;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .user-modal-content {
                margin: 10% auto;
                width: 95%;
                padding: 20px;
            }

            .user-info-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }

            .user-actions {
                flex-direction: column;
            }

            .user-action-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 模块初始化函数
function initializeUserManagementModule() {
    debugInfo('userManagement', '用户管理模块已初始化');
    
    // 确保模态框样式已加载
    injectUserManagementStyles();
    
    // 确保模态框DOM已创建
    createUserManagementModals();
}

// 创建用户管理所需的模态框
function createUserManagementModals() {
    const existingModal = document.getElementById('user-detail-modal');
    if (existingModal) return; // 避免重复创建
    
    const modalHTML = `
        <!-- 用户详情模态框 -->
        <div id="user-detail-modal" class="user-modal">
            <div class="user-modal-content">
                <div class="user-modal-header">
                    <h3 class="user-modal-title">用户详情</h3>
                    <button class="user-close" onclick="closeUserModal()">&times;</button>
                </div>
                
                <div class="user-info-grid">
                    <div class="user-info-card">
                        <div class="user-info-label">用户ID</div>
                        <div class="user-info-value" id="modal-user-id">-</div>
                    </div>
                    
                    <div class="user-info-card">
                        <div class="user-info-label">邮箱地址</div>
                        <div class="user-info-value" id="modal-user-email">-</div>
                    </div>
                    
                    <div class="user-info-card">
                        <div class="user-info-label">用户角色</div>
                        <div class="user-info-value" id="modal-user-role">-</div>
                    </div>
                    
                    <div class="user-info-card">
                        <div class="user-info-label">账户状态</div>
                        <div class="user-info-value" id="modal-user-status">-</div>
                    </div>
                    
                    <div class="user-info-card">
                        <div class="user-info-label">注册时间</div>
                        <div class="user-info-value" id="modal-user-created">-</div>
                    </div>
                    
                    <div class="user-info-card">
                        <div class="user-info-label">最后登录</div>
                        <div class="user-info-value" id="modal-user-lastlogin">-</div>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button id="toggle-status-btn" class="user-action-btn warning" onclick="toggleUserStatus()">
                        修改状态
                    </button>
                    <button class="user-action-btn danger" onclick="resetUserPassword()">
                        重置密码
                    </button>
                    <button id="soft-delete-btn" class="user-action-btn danger" onclick="softDeleteUser()">
                        软删除
                    </button>
                    <button id="anonymize-btn" class="user-action-btn warning" onclick="anonymizeUser()">
                        数据脱敏
                    </button>
                    <button id="restore-btn" class="user-action-btn success" onclick="restoreUser()" style="display: none;">
                        恢复账户
                    </button>
                    <button class="user-action-btn" onclick="closeUserModal()">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 存储当前查看的用户信息
let currentUserData = null;

/**
 * 查看用户详情
 * @param {number} userId - 用户ID
 */
async function viewUser(userId) {
    try {
        console.log(`正在获取用户 ${userId} 的详情...`);
        
        // 显示加载状态
        showUserModal();
        setModalLoading(true);
        
        // 获取用户详情
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '获取用户信息失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const userData = await response.json();
        currentUserData = userData;
        
        // 填充用户信息到模态框
        populateUserModal(userData);
        setModalLoading(false);
        
    } catch (error) {
        console.error('获取用户详情失败:', error);
        setModalLoading(false);
        alert(`获取用户信息失败: ${error.message}`);
        closeUserModal();
    }
}

/**
 * 显示用户模态框
 */
function showUserModal() {
    const modal = document.getElementById('user-detail-modal');
    if (modal) {
        modal.style.display = 'block';
        // 添加显示动画
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
}

/**
 * 关闭用户模态框
 */
function closeUserModal() {
    const modal = document.getElementById('user-detail-modal');
    if (modal) {
        modal.style.display = 'none';
        currentUserData = null;
    }
}

/**
 * 设置模态框加载状态
 * @param {boolean} isLoading - 是否正在加载
 */
function setModalLoading(isLoading) {
    const loadingText = isLoading ? '加载中...' : '-';
    const elements = [
        'modal-user-id',
        'modal-user-email', 
        'modal-user-role',
        'modal-user-status',
        'modal-user-created',
        'modal-user-lastlogin'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element && isLoading) {
            element.textContent = loadingText;
        }
    });
}

/**
 * 填充用户信息到模态框
 * @param {Object} userData - 用户数据
 */
function populateUserModal(userData) {
    // 基本信息
    document.getElementById('modal-user-id').textContent = userData.id || '-';
    document.getElementById('modal-user-email').textContent = userData.email || '-';
    document.getElementById('modal-user-role').textContent = getRoleDisplayName(userData.role) || '-';
    
    // 状态显示
    const statusElement = document.getElementById('modal-user-status');
    const statusBadge = createStatusBadge(userData.status);
    statusElement.innerHTML = '';
    statusElement.appendChild(statusBadge);
    
    // 时间信息
    document.getElementById('modal-user-created').textContent = 
        userData.createdAt ? formatDateTime(userData.createdAt) : '-';
    document.getElementById('modal-user-lastlogin').textContent = 
        userData.lastLoginAt ? formatDateTime(userData.lastLoginAt) : '从未登录';
    
    // 更新操作按钮
    updateActionButtons(userData);
}

/**
 * 创建状态徽章元素
 * @param {string} status - 用户状态
 * @returns {HTMLElement} 状态徽章元素
 */
function createStatusBadge(status) {
    const badge = document.createElement('span');
    badge.className = `user-status-badge status-${status}`;
    badge.textContent = getStatusDisplayName(status);
    return badge;
}

/**
 * 获取角色显示名称
 * @param {string} role - 角色代码
 * @returns {string} 角色显示名称
 */
function getRoleDisplayName(role) {
    const roleMap = {
        'user': '普通用户',
        'admin': '管理员',
        'super_admin': '超级管理员',
        'moderator': '版主'
    };
    return roleMap[role] || role;
}

/**
 * 获取状态显示名称
 * @param {string} status - 状态代码
 * @returns {string} 状态显示名称
 */
function getStatusDisplayName(status) {
    const statusMap = {
        'active': '正常',
        'disabled': '已禁用',
        'suspended': '已暂停',
        'deleted': '已删除',
        'anonymized': '已脱敏'
    };
    return statusMap[status] || status;
}

/**
 * 格式化日期时间
 * @param {string|number} dateTime - 日期时间
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(dateTime) {
    try {
        const date = new Date(dateTime);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return '无效日期';
    }
}

/**
 * 更新操作按钮状态
 * @param {Object} userData - 用户数据
 */
function updateActionButtons(userData) {
    const toggleBtn = document.getElementById('toggle-status-btn');
    const softDeleteBtn = document.getElementById('soft-delete-btn');
    const anonymizeBtn = document.getElementById('anonymize-btn');
    const restoreBtn = document.getElementById('restore-btn');
    
    if (!toggleBtn) return;
    
    // 超级管理员账户的特殊处理
    const isProtectedAccount = userData.role === 'super_admin';
    const isDeletedOrAnonymized = ['deleted', 'anonymized'].includes(userData.status);
    
    // 基本操作按钮
    if (isProtectedAccount) {
        toggleBtn.disabled = true;
        toggleBtn.textContent = '无法修改';
        toggleBtn.title = '超级管理员账户不可修改状态';
    } else {
        toggleBtn.disabled = isDeletedOrAnonymized;
        toggleBtn.title = '';
        
        if (userData.status === 'active') {
            toggleBtn.textContent = '禁用账户';
            toggleBtn.className = 'user-action-btn danger';
        } else if (userData.status === 'disabled') {
            toggleBtn.textContent = '启用账户';
            toggleBtn.className = 'user-action-btn success';
        } else {
            toggleBtn.textContent = '修改状态';
            toggleBtn.className = 'user-action-btn warning';
        }
    }
    
    // 软删除按钮
    if (softDeleteBtn) {
        softDeleteBtn.style.display = (isProtectedAccount || userData.status === 'deleted' || userData.status === 'anonymized') ? 'none' : 'inline-block';
    }
    
    // 数据脱敏按钮
    if (anonymizeBtn) {
        anonymizeBtn.style.display = (isProtectedAccount || userData.status === 'anonymized') ? 'none' : 'inline-block';
    }
    
    // 恢复按钮
    if (restoreBtn) {
        restoreBtn.style.display = (userData.status === 'deleted') ? 'inline-block' : 'none';
    }
}

/**
 * 切换用户状态
 */
async function toggleUserStatus() {
    if (!currentUserData) {
        alert('用户数据不可用');
        return;
    }
    
    const userId = currentUserData.id;
    const currentStatus = currentUserData.status;
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    
    // 确认操作
    const action = newStatus === 'active' ? '启用' : '禁用';
    if (!confirm(`确定要${action}用户 ${currentUserData.email} 吗？`)) {
        return;
    }
    
    try {
        console.log(`正在${action}用户 ${userId}...`);
        
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '操作失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        // 更新当前用户数据
        currentUserData.status = newStatus;
        
        // 重新填充模态框
        populateUserModal(currentUserData);
        
        // 刷新用户列表
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
        
        alert(`用户状态已${action}成功`);
        
    } catch (error) {
        console.error('修改用户状态失败:', error);
        alert(`修改状态失败: ${error.message}`);
    }
}

/**
 * 重置用户密码
 */
async function resetUserPassword() {
    if (!currentUserData) {
        alert('用户数据不可用');
        return;
    }
    
    const userId = currentUserData.id;
    
    // 确认操作
    if (!confirm(`确定要重置用户 ${currentUserData.email} 的密码吗？\n\n新密码将随机生成并显示在弹窗中。`)) {
        return;
    }
    
    try {
        console.log(`正在重置用户 ${userId} 的密码...`);
        
        const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '重置密码失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 显示新密码
        alert(`密码重置成功！\n\n新密码: ${result.tempPassword}\n\n请将新密码提供给用户，建议用户登录后立即修改密码。`);
        
    } catch (error) {
        console.error('重置密码失败:', error);
        alert(`重置密码失败: ${error.message}`);
    }
}

/**
 * 软删除用户账户
 */
async function softDeleteUser() {
    if (!currentUserData) {
        alert('用户数据不可用');
        return;
    }
    
    const userId = currentUserData.id;
    
    // 获取删除原因
    const reason = prompt('请输入删除原因（可选）：', '');
    
    // 确认操作
    const confirmMsg = `确定要软删除用户 ${currentUserData.email} 吗？\n\n软删除将：\n- 设置账户状态为“已删除”\n- 保留所有业务数据和历史记录\n- 用户无法登录但数据可恢复`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        console.log(`正在软删除用户 ${userId}...`);
        
        const response = await fetch(`/api/admin/users/${userId}/soft-delete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '软删除失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 更新当前用户数据
        currentUserData.status = 'deleted';
        
        // 重新填充模态框
        populateUserModal(currentUserData);
        
        // 刷新用户列表
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
        
        alert(`${result.message}\n\n注意：${result.note}`);
        
    } catch (error) {
        console.error('软删除用户失败:', error);
        alert(`软删除失败: ${error.message}`);
    }
}

/**
 * 数据脱敏处理
 */
async function anonymizeUser() {
    if (!currentUserData) {
        alert('用户数据不可用');
        return;
    }
    
    const userId = currentUserData.id;
    
    // 获取脱敏原因
    const reason = prompt('请输入数据脱敏原因（如GDPR申请、用户要求等）：', 'GDPR合规要求');
    
    if (!reason || reason.trim() === '') {
        alert('请输入数据脱敏的原因');
        return;
    }
    
    // 确认操作
    const confirmMsg = `确定要对用户 ${currentUserData.email} 进行数据脱敏处理吗？\n\n数据脱敏将：\n- 清除个人敏感信息（邮箱等）\n- 保留业务记录结构\n- 操作不可逆转！`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // 二次确认
    if (!confirm('最后确认：数据脱敏操作不可逆转，确定继续吗？')) {
        return;
    }
    
    try {
        console.log(`正在对用户 ${userId} 进行数据脱敏处理...`);
        
        const response = await fetch(`/api/admin/users/${userId}/anonymize`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '数据脱敏失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 更新当前用户数据
        currentUserData.status = 'anonymized';
        currentUserData.email = '已脱敏';
        
        // 重新填充模态框
        populateUserModal(currentUserData);
        
        // 刷新用户列表
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
        
        alert(`${result.message}\n\n注意：${result.note}`);
        
    } catch (error) {
        console.error('数据脱敏失败:', error);
        alert(`数据脱敏失败: ${error.message}`);
    }
}

/**
 * 恢复已删除的用户账户
 */
async function restoreUser() {
    if (!currentUserData) {
        alert('用户数据不可用');
        return;
    }
    
    const userId = currentUserData.id;
    
    if (currentUserData.status !== 'deleted') {
        alert('只能恢复已删除的用户账户');
        return;
    }
    
    // 获取恢复原因
    const reason = prompt('请输入恢复原因：', '用户账户恢复');
    
    // 确认操作
    if (!confirm(`确定要恢复用户 ${currentUserData.email} 的账户吗？`)) {
        return;
    }
    
    try {
        console.log(`正在恢复用户 ${userId}...`);
        
        const response = await fetch(`/api/admin/users/${userId}/restore`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '恢复失败' }));
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 更新当前用户数据
        currentUserData.status = 'active';
        
        // 重新填充模态框
        populateUserModal(currentUserData);
        
        // 刷新用户列表
        if (typeof loadUsersData === 'function') {
            loadUsersData();
        }
        
        alert(result.message);
        
    } catch (error) {
        console.error('恢复用户失败:', error);
        alert(`恢复失败: ${error.message}`);
    }
}
document.addEventListener('click', function(event) {
    const modal = document.getElementById('user-detail-modal');
    if (event.target === modal) {
        closeUserModal();
    }
});

// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('user-detail-modal');
    if (event.target === modal) {
        closeUserModal();
    }
});

// 导出模块函数到全局作用域
window.initializeUserManagementModule = initializeUserManagementModule;
window.viewUser = viewUser;
window.closeUserModal = closeUserModal;
window.toggleUserStatus = toggleUserStatus;
window.resetUserPassword = resetUserPassword;
window.softDeleteUser = softDeleteUser;
window.anonymizeUser = anonymizeUser;
window.restoreUser = restoreUser;

// CommonJS 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeUserManagementModule,
        viewUser,
        closeUserModal,
        toggleUserStatus,
        resetUserPassword,
        softDeleteUser,
        anonymizeUser,
        restoreUser
    };
}

debugInfo('userManagement', '用户管理模块已加载');