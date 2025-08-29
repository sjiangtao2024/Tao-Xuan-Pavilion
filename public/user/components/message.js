/**
 * 消息提示组件
 * 显示各种类型的消息提示
 */

window.MessageComponent = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前消息元素
    currentMessage: null,
    
    // 消息队列
    messageQueue: [],
    
    // 是否正在显示消息
    isShowing: false,
    
    // 初始化
    init: function() {
        this.createMessageContainer();
        this.isInitialized = true;
        window.DEBUG_UTILS.log('message', 'Message component initialized');
    },
    
    // 创建消息容器
    createMessageContainer: function() {
        let container = window.DOMUtils.get('#message-modal');
        if (!container) {
            container = window.DOMUtils.create('div', 'message-modal hidden', '');
            container.id = 'message-modal';
            document.body.appendChild(container);
        }
        this.currentMessage = container;
    },
    
    // 显示消息
    show: function(message, type = 'info', duration = null) {
        const messageData = {
            text: message,
            type: type,
            duration: duration || window.APP_CONFIG.MESSAGE_DISPLAY_DURATION
        };
        
        if (this.isShowing) {
            // 如果正在显示消息，添加到队列
            this.messageQueue.push(messageData);
        } else {
            // 立即显示消息
            this.displayMessage(messageData);
        }
    },
    
    // 显示消息的具体实现
    displayMessage: function(messageData) {
        if (!this.currentMessage) {
            this.createMessageContainer();
        }
        
        this.isShowing = true;
        
        // 设置消息内容和样式
        // 检查是否有message-text子元素，如果有则使用它，否则直接设置容器文本
        const messageTextElement = this.currentMessage.querySelector('#message-text');
        if (messageTextElement) {
            messageTextElement.textContent = messageData.text;
        } else {
            this.currentMessage.textContent = messageData.text;
        }
        
        this.currentMessage.className = `message-modal ${messageData.type}`;
        
        // 显示消息
        setTimeout(() => {
            this.currentMessage.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            this.hide();
        }, messageData.duration);
        
        // 触发事件
        window.EventUtils.emit(window.APP_EVENTS.MESSAGE_SHOWN, messageData);
        
        window.DEBUG_UTILS.log('message', `Message shown (${messageData.type}):`, messageData.text);
    },
    
    // 隐藏消息
    hide: function() {
        if (!this.currentMessage || !this.isShowing) {
            return;
        }
        
        this.currentMessage.classList.remove('show');
        
        setTimeout(() => {
            this.currentMessage.classList.add('hidden');
            this.isShowing = false;
            
            // 处理队列中的下一个消息
            if (this.messageQueue.length > 0) {
                const nextMessage = this.messageQueue.shift();
                setTimeout(() => {
                    this.displayMessage(nextMessage);
                }, 200); // 稍微延迟以避免重叠
            }
        }, 300); // 等待动画完成
    },
    
    // 显示成功消息
    success: function(message, duration = null) {
        this.show(message, 'success', duration);
    },
    
    // 显示错误消息
    error: function(message, duration = null) {
        this.show(message, 'error', duration);
    },
    
    // 显示警告消息
    warning: function(message, duration = null) {
        this.show(message, 'warning', duration);
    },
    
    // 显示信息消息
    info: function(message, duration = null) {
        this.show(message, 'info', duration);
    },
    
    // 清空消息队列
    clearQueue: function() {
        this.messageQueue = [];
        window.DEBUG_UTILS.log('message', 'Message queue cleared');
    },
    
    // 立即隐藏当前消息
    dismiss: function() {
        this.hide();
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.MessageComponent.init();
});

window.DEBUG_UTILS.log('message', 'Message component loaded');