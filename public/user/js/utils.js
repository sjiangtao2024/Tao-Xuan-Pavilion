/**
 * 工具函数集合
 * 提供通用的辅助函数
 */

// DOM操作工具
window.DOMUtils = {
    // 获取元素
    get: function(selector) {
        return document.querySelector(selector);
    },
    
    // 获取所有元素
    getAll: function(selector) {
        return document.querySelectorAll(selector);
    },
    
    // 创建元素
    create: function(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    },
    
    // 显示元素
    show: function(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // 隐藏元素
    hide: function(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    // 切换显示/隐藏
    toggle: function(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    }
};

// API请求工具
window.APIUtils = {
    // 通用请求方法
    request: async function(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        // 添加认证token
        const token = window.StorageUtils.get(window.APP_CONFIG.STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            window.DEBUG_UTILS.log('api', `Request to ${endpoint} with auth token`);
        } else {
            window.DEBUG_UTILS.log('api', `Request to ${endpoint} without auth token`);
        }
        
        try {
            const response = await fetch(endpoint, config);
            const data = await response.json();
            
            if (!response.ok) {
                const errorMessage = data.message || `HTTP Error: ${response.status}`;
                const error = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }
            
            return data;
        } catch (error) {
            // 对于401错误（未授权），使用更友好的日志级别
            if (error.status === 401) {
                window.DEBUG_UTILS.log('api', `Unauthorized request to ${endpoint} - user not logged in`);
            } else {
                window.DEBUG_UTILS.error('api', 'Request failed:', error);
            }
            throw error;
        }
    },
    
    // GET请求
    get: function(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    // POST请求
    post: function(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT请求
    put: function(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE请求
    delete: function(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// 本地存储工具
window.StorageUtils = {
    // 保存数据
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            window.DEBUG_UTILS.error('storage', 'Failed to save data:', error);
            return false;
        }
    },
    
    // 获取数据
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            window.DEBUG_UTILS.error('storage', 'Failed to retrieve data:', error);
            return defaultValue;
        }
    },
    
    // 删除数据
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            window.DEBUG_UTILS.error('storage', 'Failed to remove data:', error);
            return false;
        }
    },
    
    // 清空所有数据
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            window.DEBUG_UTILS.error('storage', 'Failed to clear storage:', error);
            return false;
        }
    }
};

// 验证工具
window.ValidationUtils = {
    // 邮箱验证
    email: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // 密码验证
    password: function(password) {
        return password && password.length >= 6;
    },
    
    // 必填字段验证
    required: function(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    },
    
    // 数字验证
    number: function(value) {
        return !isNaN(value) && isFinite(value);
    },
    
    // 正整数验证
    positiveInteger: function(value) {
        return this.number(value) && parseInt(value) > 0 && parseInt(value) === parseFloat(value);
    }
};

// 格式化工具
window.FormatUtils = {
    // 格式化价格
    price: function(price, currency = '¥') {
        if (!window.ValidationUtils.number(price)) {
            return currency + '0.00';
        }
        return currency + parseFloat(price).toFixed(2);
    },
    
    // 格式化日期
    date: function(dateString, format = 'YYYY-MM-DD') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },
    
    // 截断文本
    truncate: function(text, maxLength = 50, suffix = '...') {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength - suffix.length) + suffix;
    },
    
    // 格式化数量
    quantity: function(qty) {
        return Math.max(1, parseInt(qty) || 1);
    }
};

// 事件工具
window.EventUtils = {
    // 触发自定义事件
    emit: function(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
        window.DEBUG_UTILS.log('event', `Event emitted: ${eventName}`, data);
    },
    
    // 监听自定义事件
    on: function(eventName, callback) {
        document.addEventListener(eventName, callback);
        window.DEBUG_UTILS.log('event', `Event listener added: ${eventName}`);
    },
    
    // 移除事件监听
    off: function(eventName, callback) {
        document.removeEventListener(eventName, callback);
        window.DEBUG_UTILS.log('event', `Event listener removed: ${eventName}`);
    },
    
    // 防抖函数
    debounce: function(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// URL工具
window.URLUtils = {
    // 解析URL参数
    getParams: function() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },
    
    // 获取单个URL参数
    getParam: function(name, defaultValue = null) {
        const params = this.getParams();
        return params[name] || defaultValue;
    },
    
    // 更新URL参数
    updateParams: function(params, replace = true) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        
        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }
};

// 初始化工具
window.DEBUG_UTILS.log('utils', 'Utility functions loaded');