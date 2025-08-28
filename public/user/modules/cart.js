/**
 * 购物车模块 - 简化版
 * 采用 frontend.html 的简单直接方式
 */

window.CartModule = {
    // 模块初始化状态
    isInitialized: false,
    
    // 防止重复绑定事件
    modalEventsBound: false,
    
    // 防止重复操作标志
    isUpdatingQuantity: false,
    isRemovingItem: false,
    
    // 购物车数据
    cart: { items: [] },
    
    // 初始化
    init: function() {
        // 防止重复初始化
        if (this.isInitialized) {
            window.DEBUG_UTILS.warn('cart', 'Cart module already initialized, skipping...');
            return;
        }
        
        this.bindEvents();
        this.updateCartUI();
        
        // 如果用户已登录，加载购物车数据
        if (window.AuthModule && window.AuthModule.isLoggedIn()) {
            this.loadCartFromServer();
        }
        
        this.isInitialized = true;
        window.DEBUG_UTILS.success('cart', '购物车模块初始化成功');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 绑定购物车按钮
        const cartButton = window.DOMUtils.get('#cart-button');
        if (cartButton) {
            cartButton.addEventListener('click', () => {
                this.openCart();
            });
        }
        
        // 监听用户登录事件 - 简单处理
        window.EventUtils.on(window.APP_EVENTS.USER_LOGIN, async (event) => {
            window.DEBUG_UTILS.log('cart', 'User login - loading cart from server', event.detail);
            // 等待一小段时间确保 token 已保存
            setTimeout(async () => {
                await this.loadCartFromServer();
            }, 100);
        });
        
        // 监听用户登出事件 - 简单处理
        window.EventUtils.on(window.APP_EVENTS.USER_LOGOUT, (event) => {
            window.DEBUG_UTILS.log('cart', 'User logout - clearing cart');
            this.cart = { items: [] };
            this.updateCartUI();
        });
        
        // 监听应用初始化完成事件，确保认证状态检查完成后加载购物车
        window.EventUtils.on('app-initialized', async () => {
            window.DEBUG_UTILS.log('cart', 'App initialized - checking if need to load cart');
            // 等待一小段时间确保认证检查完成
            setTimeout(async () => {
                if (window.AuthModule && window.AuthModule.isLoggedIn()) {
                    await this.loadCartFromServer();
                }
            }, 200);
        });
    },
    
    // 添加商品到购物车
    addItem: async function(product, quantity = 1) {
        // 检查登录状态
        if (!window.AuthModule.isLoggedIn()) {
            const loginMsg = window.t ? window.t('loginRequired') : 'Please login first';
            window.MessageComponent.warning(loginMsg);
            return;
        }
        
        try {
            const updatedCart = await window.APIUtils.post('/api/cart/items', {
                productId: product.id,
                quantity: quantity
            });
            
            // 直接替换购物车数据 - 关键点
            this.cart = updatedCart;
            this.updateCartUI();
            
            // 显示成功消息
            const successMsg = window.t ? window.t('itemAddedToCart') : 'Item added to cart successfully';
            window.MessageComponent.success(successMsg);
            
            window.DEBUG_UTILS.success('cart', 'Item added successfully');
        } catch (error) {
            const errorMsg = window.t ? window.t('addItemFailed') : 'Failed to add item to cart';
            window.MessageComponent.error(errorMsg);
            window.DEBUG_UTILS.error('cart', 'Failed to add item:', error);
        }
    },
    
    // 从服务器加载购物车
    loadCartFromServer: async function() {
        if (!window.AuthModule.isLoggedIn()) {
            this.cart = { items: [] };
            this.updateCartUI();
            return;
        }
        
        try {
            const cartData = await window.APIUtils.get('/api/cart');
            window.DEBUG_UTILS.log('cart', 'Raw cart data from server:', cartData);
            
            // 直接替换购物车数据 - 关键点
            this.cart = cartData || { items: [] };
            
            // 确保每个商品都有正确的价格数据
            if (this.cart.items) {
                this.cart.items.forEach(item => {
                    window.DEBUG_UTILS.log('cart', 'Cart item structure:', item);
                });
            }
            
            this.updateCartUI();
            
            window.DEBUG_UTILS.log('cart', 'Cart loaded from server');
        } catch (error) {
            window.DEBUG_UTILS.warn('cart', 'Failed to load cart from server:', error);
            this.cart = { items: [] };
            this.updateCartUI();
        }
    },
    
    // 更新购物车UI
    updateCartUI: function() {
        const totalItems = this.getTotalItems();
        
        // 更新购物车计数
        const cartCount = window.DOMUtils.get('#cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        window.DEBUG_UTILS.log('cart', 'Cart UI updated, total items:', totalItems);
    },
    
    // 获取购物车总数量
    getTotalItems: function() {
        return this.cart.items ? this.cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    },
    
    // 获取购物车总价
    getTotalPrice: function() {
        if (!this.cart.items || this.cart.items.length === 0) {
            return 0;
        }
        
        const total = this.cart.items.reduce((sum, item) => {
            // 支持多种价格数据结构
            const itemPrice = parseFloat(item.price || item.product?.price || 0);
            const itemQuantity = parseInt(item.quantity || 1);
            
            window.DEBUG_UTILS.log('cart', `Price calculation: ${itemPrice} x ${itemQuantity} = ${itemPrice * itemQuantity}`);
            
            return sum + (itemPrice * itemQuantity);
        }, 0);
        
        window.DEBUG_UTILS.log('cart', 'Total cart price:', total);
        return total;
    },
    
    // 打开购物车模态框
    openCart: function() {
        // 先创建模态框结构（如果还没有）
        if (window.ModalComponent && window.ModalComponent.createCartModal) {
            window.ModalComponent.createCartModal();
        }
        
        this.renderCartModal();
        window.ModalComponent.open('cart-modal');
    },
    
    // 渲染购物车模态框内容
    renderCartModal: function() {
        const cartItems = window.DOMUtils.get('#cart-items');
        const cartSummary = window.DOMUtils.get('#cart-summary');
        const cartEmpty = window.DOMUtils.get('#cart-empty');
        const cartTotal = window.DOMUtils.get('#cart-total');
        
        if (!cartItems) return;
        
        window.DEBUG_UTILS.log('cart', 'Rendering cart modal with items:', this.cart.items);
        
        if (!this.cart.items || this.cart.items.length === 0) {
            // 空购物车 - 只显示 cart-empty 元素，不在 cart-items 中添加重复内容
            if (cartSummary) window.DOMUtils.hide(cartSummary);
            if (cartEmpty) window.DOMUtils.show(cartEmpty);
            cartItems.innerHTML = ''; // 清空 cart-items 内容，避免重复显示
        } else {
            // 有商品
            if (cartSummary) window.DOMUtils.show(cartSummary);
            if (cartEmpty) window.DOMUtils.hide(cartEmpty);
            
            cartItems.innerHTML = this.cart.items.map(item => this.renderCartItem(item)).join('');
            
            // 更新总价
            const totalPrice = this.getTotalPrice();
            if (cartTotal) {
                cartTotal.textContent = '$' + totalPrice.toFixed(2);
                window.DEBUG_UTILS.log('cart', 'Cart total updated to:', '$' + totalPrice.toFixed(2));
            }
        }
        
        // 只在第一次渲染时绑定事件
        this.bindCartModalEvents();
    },
    
    // 绑定购物车模态框内的事件
    bindCartModalEvents: function() {
        // 防止重复绑定
        if (this.modalEventsBound) {
            window.DEBUG_UTILS.log('cart', 'Modal events already bound, skipping...');
            return;
        }
        
        const cartModal = window.DOMUtils.get('#cart-modal');
        if (!cartModal) return;
        
        // 数量输入事件 - 使用事件委托
        cartModal.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const productId = e.target.getAttribute('data-product-id');
                const quantity = parseInt(e.target.value);
                window.DEBUG_UTILS.log('cart', `Quantity change detected: ${productId} -> ${quantity}`);
                this.updateQuantity(productId, quantity);
            }
        });
        
        // 移除商品按钮 - 使用事件委托
        cartModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const productId = e.target.getAttribute('data-product-id');
                window.DEBUG_UTILS.log('cart', `Remove item clicked: ${productId}`);
                this.removeItem(productId);
            }
            
            // Clear Cart 按钮
            if (e.target.id === 'clear-cart-btn' || e.target.closest('#clear-cart-btn')) {
                window.DEBUG_UTILS.log('cart', 'Clear cart button clicked');
                this.clearCart();
            }
            
            // Checkout 按钮
            if (e.target.id === 'checkout-btn' || e.target.closest('#checkout-btn')) {
                window.DEBUG_UTILS.log('cart', 'Checkout button clicked');
                this.checkout();
            }
        });
        
        this.modalEventsBound = true;
        window.DEBUG_UTILS.log('cart', 'Cart modal events bound successfully');
    },
    
    // 清空购物车
    clearCart: async function() {
        if (!window.AuthModule.isLoggedIn()) return;
        
        try {
            window.DEBUG_UTILS.log('cart', 'Clearing cart...');
            
            // 先在本地清空
            this.cart = { items: [] };
            this.updateCartUI();
            this.renderCartModal();
            
            // 调用服务器API清空购物车
            await window.APIUtils.delete('/api/cart');
            
            const successMsg = window.t ? window.t('cartCleared') : 'Cart cleared successfully';
            window.MessageComponent.success(successMsg);
            window.DEBUG_UTILS.success('cart', 'Cart cleared successfully');
        } catch (error) {
            const errorMsg = window.t ? window.t('clearCartFailed') : 'Failed to clear cart';
            window.MessageComponent.error(errorMsg);
            window.DEBUG_UTILS.error('cart', 'Failed to clear cart:', error);
            
            // 如果清空失败，重新从服务器加载数据
            await this.loadCartFromServer();
        }
    },
    
    // 结算
    checkout: async function() {
        if (!window.AuthModule.isLoggedIn()) {
            const loginMsg = window.t ? window.t('loginRequired') : 'Please login first';
            window.MessageComponent.warning(loginMsg);
            return;
        }
        
        if (!this.cart.items || this.cart.items.length === 0) {
            const emptyCartMsg = window.t ? window.t('cartEmpty') : 'Your cart is empty';
            window.MessageComponent.warning(emptyCartMsg);
            return;
        }
        
        try {
            const response = await window.APIUtils.post('/api/cart/checkout', {
                items: this.cart.items
            });
            
            if (response.success) {
                // 清空购物车
                this.cart = { items: [] };
                this.updateCartUI();
                
                // 关闭模态框
                window.ModalComponent.close();
                
                // 显示成功消息
                const successMsg = window.t ? window.t('orderCreated') : 'Order created successfully!';
                window.MessageComponent.success(successMsg);
                
                window.DEBUG_UTILS.log('cart', 'Checkout successful:', response.orderId);
            } else {
                throw new Error(response.message || '结算失败');
            }
        } catch (error) {
            const errorMsg = window.t ? window.t('checkoutFailed') : 'Checkout failed';
            window.MessageComponent.error(errorMsg + '：' + error.message);
            window.DEBUG_UTILS.error('cart', 'Checkout failed:', error);
        }
    },
    
    // 渲染单个购物车商品
    renderCartItem: function(item) {
        const itemImage = item.image || item.product?.media?.[0]?.asset?.url || '/placeholder.svg';
        const itemName = item.name || item.product?.name || '未知商品';
        const itemPrice = item.price || item.product?.price || 0;
        
        return `
            <div class="cart-item flex items-center gap-4 p-4 border-b" data-product-id="${item.id}">
                <img src="${itemImage}" alt="${itemName}" class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                    <div class="font-medium">${itemName}</div>
                    <div class="text-gray-600">$${itemPrice}</div>
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" class="quantity-input w-16 p-1 border rounded text-center" 
                           value="${item.quantity}" min="1" max="99" 
                           data-product-id="${item.id}">
                    <button class="remove-item-btn text-red-500 hover:text-red-700 p-1" 
                            data-product-id="${item.id}" title="移除商品">
                        ×
                    </button>
                </div>
            </div>
        `;
    },
    
    // 移除商品
    removeItem: async function(productId) {
        if (!window.AuthModule.isLoggedIn()) return;
        
        // 防止重复调用
        if (this.isRemovingItem) {
            window.DEBUG_UTILS.warn('cart', 'Remove item already in progress, skipping...');
            return;
        }
        
        try {
            this.isRemovingItem = true;
            window.DEBUG_UTILS.log('cart', `Removing item: ${productId}`);
            
            // 先在本地移除商品（像frontend.html一样）
            this.cart.items = this.cart.items.filter(item => item.id !== parseInt(productId));
            window.DEBUG_UTILS.log('cart', 'Local cart updated, item removed');
            
            // 发送API请求
            await window.APIUtils.delete(`/api/cart/items/${productId}`);
            
            // 使用本地已更新的数据
            this.updateCartUI();
            this.renderCartModal();
            
            window.MessageComponent.info('商品已移除');
            window.DEBUG_UTILS.success('cart', 'Item removed successfully');
        } catch (error) {
            const errorMsg = window.t ? window.t('removeItemFailed') : 'Failed to remove item';
            window.MessageComponent.error(errorMsg);
            window.DEBUG_UTILS.error('cart', 'Failed to remove item:', error);
            
            // 如果移除失败，重新从服务器加载购物车数据
            await this.loadCartFromServer();
        } finally {
            this.isRemovingItem = false;
        }
    },
    
    // 更新商品数量
    updateQuantity: async function(productId, quantity) {
        if (!window.AuthModule.isLoggedIn()) return;
        
        // 防止重复调用
        if (this.isUpdatingQuantity) {
            window.DEBUG_UTILS.warn('cart', 'Update quantity already in progress, skipping...');
            return;
        }
        
        try {
            this.isUpdatingQuantity = true;
            window.DEBUG_UTILS.log('cart', `Updating quantity for product ${productId} to ${quantity}`);
            
            // 先在本地更新数据（像frontend.html一样）
            const itemIndex = this.cart.items.findIndex(item => item.id === parseInt(productId));
            if (itemIndex !== -1) {
                this.cart.items[itemIndex].quantity = quantity;
                window.DEBUG_UTILS.log('cart', 'Local cart updated, new quantity:', quantity);
            }
            
            // 发送API请求
            const response = await window.APIUtils.put(`/api/cart/items/${productId}`, {
                quantity: quantity
            });
            
            window.DEBUG_UTILS.log('cart', 'Server response:', response);
            
            // 不依赖服务器返回的数据，使用本地已更新的数据
            this.updateCartUI();
            this.renderCartModal(); // 重新渲染模态框
            
            window.DEBUG_UTILS.success('cart', 'Quantity updated successfully');
        } catch (error) {
            const errorMsg = window.t ? window.t('updateQuantityFailed') : 'Failed to update quantity';
            window.MessageComponent.error(errorMsg);
            window.DEBUG_UTILS.error('cart', 'Failed to update quantity:', error);
            
            // 如果更新失败，重新从服务器加载购物车数据
            await this.loadCartFromServer();
        } finally {
            this.isUpdatingQuantity = false;
        }
    }
};

window.DEBUG_UTILS.log('cart', 'Simplified cart module loaded');