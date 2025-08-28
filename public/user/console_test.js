/**
 * 🔧 产品模块修复验证脚本
 * 在主页面控制台中运行此脚本来验证修复效果
 * 
 * 使用方法：
 * 1. 打开 http://localhost:8787/user/
 * 2. 打开浏览器开发者工具 (F12)
 * 3. 在控制台中粘贴此脚本并运行
 * 4. 查看测试结果
 */

async function testProductModuleFix() {
    console.group('🔧 产品模块修复验证');
    console.log('开始验证修复效果...\n');
    
    // 1. 检查模块加载状态
    console.group('📦 模块加载检查');
    
    const modules = [
        { name: 'ProductModule', obj: window.ProductModule },
        { name: 'ShopModule', obj: window.ShopModule },
        { name: 'NavigationModule', obj: window.NavigationModule },
        { name: 'DEBUG_UTILS', obj: window.DEBUG_UTILS }
    ];
    
    modules.forEach(module => {
        if (module.obj) {
            console.log(`✅ ${module.name} 已加载`);
        } else {
            console.error(`❌ ${module.name} 未加载!`);
        }
    });
    console.groupEnd();
    
    // 2. 检查 ProductModule 关键函数
    if (window.ProductModule) {
        console.group('🔍 ProductModule 函数检查');
        const requiredFunctions = [
            'loadProductFromServer',
            'renderProductPage', 
            'renderProductMedia',
            'initCarousel'
        ];
        
        requiredFunctions.forEach(func => {
            if (typeof window.ProductModule[func] === 'function') {
                console.log(`✅ ${func}() 函数存在`);
            } else {
                console.error(`❌ ${func}() 函数缺失!`);
            }
        });
        console.groupEnd();
    }
    
    // 3. 检查 ShopModule allProducts 属性
    if (window.ShopModule) {
        console.group('🛍️ ShopModule 数据检查');
        if (Array.isArray(window.ShopModule.allProducts)) {
            console.log(`✅ allProducts 存在，包含 ${window.ShopModule.allProducts.length} 个产品`);
        } else {
            console.error('❌ allProducts 属性缺失或不是数组!');
        }
        console.groupEnd();
    }
    
    // 4. 测试 API 连接
    console.group('🌐 API 连接测试');
    try {
        const response = await fetch('/api/products/1?lang=en');
        if (response.ok) {
            const product = await response.json();
            console.log('✅ API 连接正常');
            console.log(`✅ 产品名称: ${product.name}`);
            
            if (product.media && product.media.length > 0) {
                console.log(`✅ 媒体数据正确: ${product.media.length} 个媒体文件`);
                console.log(`✅ 媒体结构: ${product.media[0].asset.mediaType}`);
                console.log(`✅ 媒体URL: ${product.media[0].asset.url}`);
            } else {
                console.warn('⚠️ 产品没有媒体数据');
            }
        } else {
            console.error(`❌ API 请求失败: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ API 连接错误:', error.message);
    }
    console.groupEnd();
    
    // 5. 测试产品详情页面跳转
    console.group('🔗 功能测试');
    try {
        // 测试 showProductDetail 函数
        if (typeof window.showProductDetail === 'function') {
            console.log('✅ showProductDetail() 全局函数存在');
        } else {
            console.error('❌ showProductDetail() 全局函数缺失!');
        }
        
        // 测试调试功能
        if (typeof window.testAPI === 'function') {
            console.log('✅ testAPI() 调试函数存在');
        } else {
            console.warn('⚠️ testAPI() 调试函数缺失');
        }
        
        if (typeof window.validateModules === 'function') {
            console.log('✅ validateModules() 调试函数存在');
        } else {
            console.warn('⚠️ validateModules() 调试函数缺失');
        }
        
    } catch (error) {
        console.error('❌ 功能测试错误:', error.message);
    }
    console.groupEnd();
    
    // 6. 总结
    console.group('📊 测试总结');
    console.log('修复验证完成！');
    console.log('');
    console.log('如果要测试产品详情页面，可以运行:');
    console.log('showProductDetail(1)');
    console.log('');
    console.log('如果要运行完整的系统测试，可以运行:');
    console.log('testAPI()');
    console.log('validateModules()');
    console.groupEnd();
    
    console.groupEnd();
}

// 自动运行测试
testProductModuleFix();