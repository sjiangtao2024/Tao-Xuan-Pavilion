/**
 * 模块化系统验证脚本
 * 检查所有模块是否正确加载和初始化
 */

(function() {
    'use strict';
    
    // 验证配置
    const VALIDATION_CONFIG = {
        timeout: 10000, // 10秒超时
        requiredModules: [
            'APP_CONFIG',
            'APP_STATE', 
            'DEBUG_UTILS',
            'DOMUtils',
            'APIUtils',
            'StorageUtils',
            'ValidationUtils',
            'FormatUtils',
            'EventUtils',
            'I18nManager',
            'ModalComponent',
            'MessageComponent',
            'CarouselComponent',
            'AuthModule',
            'CartModule',
            'ShopModule',
            'ProductModule',
            'ProfileModule',
            'NavigationModule',
            'App'
        ],
        requiredTranslations: ['translations_en', 'translations_zh']
    };
    
    // 验证结果
    const validationResults = {
        modules: {},
        translations: {},
        errors: [],
        warnings: [],
        passed: 0,
        failed: 0
    };
    
    // 验证单个模块
    function validateModule(moduleName) {
        try {
            const module = window[moduleName];
            
            if (!module) {
                validationResults.errors.push(`模块 ${moduleName} 未找到`);
                validationResults.modules[moduleName] = { status: 'failed', error: '模块未找到' };
                validationResults.failed++;
                return false;
            }
            
            // 检查模块是否有init方法
            if (typeof module.init === 'function') {
                if (!module.isInitialized && moduleName !== 'App') {
                    validationResults.warnings.push(`模块 ${moduleName} 有init方法但未初始化`);
                    validationResults.modules[moduleName] = { status: 'warning', message: '未初始化' };
                } else {
                    validationResults.modules[moduleName] = { status: 'passed', message: '已初始化' };
                    validationResults.passed++;
                }
            } else {
                // 对于工具类和配置对象，检查是否有核心属性
                if (moduleName.includes('Utils') || moduleName.includes('CONFIG') || moduleName.includes('STATE')) {
                    const hasProperties = Object.keys(module).length > 0;
                    if (hasProperties) {
                        validationResults.modules[moduleName] = { status: 'passed', message: '已加载' };
                        validationResults.passed++;
                    } else {
                        validationResults.modules[moduleName] = { status: 'failed', error: '模块为空' };
                        validationResults.failed++;
                    }
                } else {
                    validationResults.modules[moduleName] = { status: 'passed', message: '已加载' };
                    validationResults.passed++;
                }
            }
            
            return true;
        } catch (error) {
            validationResults.errors.push(`验证模块 ${moduleName} 时出错: ${error.message}`);
            validationResults.modules[moduleName] = { status: 'failed', error: error.message };
            validationResults.failed++;
            return false;
        }
    }
    
    // 验证翻译文件
    function validateTranslations() {
        VALIDATION_CONFIG.requiredTranslations.forEach(translationName => {
            try {
                const translation = window[translationName];
                
                if (!translation) {
                    validationResults.errors.push(`翻译文件 ${translationName} 未找到`);
                    validationResults.translations[translationName] = { status: 'failed', error: '翻译文件未找到' };
                    validationResults.failed++;
                    return;
                }
                
                const keyCount = Object.keys(translation).length;
                if (keyCount > 0) {
                    validationResults.translations[translationName] = { 
                        status: 'passed', 
                        message: `包含 ${keyCount} 个翻译键` 
                    };
                    validationResults.passed++;
                } else {
                    validationResults.translations[translationName] = { 
                        status: 'failed', 
                        error: '翻译文件为空' 
                    };
                    validationResults.failed++;
                }
            } catch (error) {
                validationResults.errors.push(`验证翻译文件 ${translationName} 时出错: ${error.message}`);
                validationResults.translations[translationName] = { status: 'failed', error: error.message };
                validationResults.failed++;
            }
        });
    }
    
    // 验证页面DOM结构
    function validateDOMStructure() {
        const requiredElements = [
            '#home-page',
            '#shop-page', 
            '#product-page',
            '#profile-page',
            '#about-page',
            '#contact-page',
            '#login-modal',
            '#register-modal',
            '#cart-modal',
            '#cart-button',
            '#lang-zh',
            '#lang-en'
        ];
        
        requiredElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                validationResults.warnings.push(`DOM元素 ${selector} 未找到`);
            }
        });
    }
    
    // 生成验证报告
    function generateReport() {
        console.group('🔍 模块化系统验证报告');
        
        // 总体状态
        const totalModules = VALIDATION_CONFIG.requiredModules.length + VALIDATION_CONFIG.requiredTranslations.length;
        const successRate = ((validationResults.passed / totalModules) * 100).toFixed(1);
        
        console.log(`📊 总体状态: ${validationResults.passed}/${totalModules} 通过 (${successRate}%)`);
        
        if (validationResults.failed > 0) {
            console.log(`❌ 失败: ${validationResults.failed}`);
        }
        
        if (validationResults.warnings.length > 0) {
            console.log(`⚠️ 警告: ${validationResults.warnings.length}`);
        }
        
        // 模块验证结果
        console.group('📦 模块验证结果');
        Object.entries(validationResults.modules).forEach(([moduleName, result]) => {
            const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
            const message = result.message || result.error || '';
            console.log(`${icon} ${moduleName}: ${message}`);
        });
        console.groupEnd();
        
        // 翻译文件验证结果
        console.group('🌍 翻译文件验证结果');
        Object.entries(validationResults.translations).forEach(([translationName, result]) => {
            const icon = result.status === 'passed' ? '✅' : '❌';
            const message = result.message || result.error || '';
            console.log(`${icon} ${translationName}: ${message}`);
        });
        console.groupEnd();
        
        // 错误列表
        if (validationResults.errors.length > 0) {
            console.group('❌ 错误列表');
            validationResults.errors.forEach(error => console.error(error));
            console.groupEnd();
        }
        
        // 警告列表
        if (validationResults.warnings.length > 0) {
            console.group('⚠️ 警告列表');
            validationResults.warnings.forEach(warning => console.warn(warning));
            console.groupEnd();
        }
        
        // 建议
        console.group('💡 建议');
        if (validationResults.failed > 0) {
            console.log('- 请检查失败的模块，确保所有JavaScript文件都已正确加载');
            console.log('- 查看浏览器控制台是否有加载错误');
        }
        if (validationResults.warnings.length > 0) {
            console.log('- 检查警告项目，虽然不影响基本功能，但建议解决');
        }
        if (validationResults.passed === totalModules) {
            console.log('🎉 所有模块验证通过！系统已准备就绪。');
        }
        console.groupEnd();
        
        console.groupEnd();
        
        return successRate >= 90;
    }
    
    // 执行验证
    function runValidation() {
        window.DEBUG_UTILS.log('validation', '🚀 开始验证模块化系统...');
        
        // 验证核心模块
        VALIDATION_CONFIG.requiredModules.forEach(validateModule);
        
        // 验证翻译文件
        validateTranslations();
        
        // 验证DOM结构
        validateDOMStructure();
        
        // 生成报告
        const isHealthy = generateReport();
        
        // 在全局作用域中暴露验证结果
        window.VALIDATION_RESULTS = validationResults;
        
        window.DEBUG_UTILS.success('validation', `验证完成，健康度: ${((validationResults.passed / (VALIDATION_CONFIG.requiredModules.length + VALIDATION_CONFIG.requiredTranslations.length)) * 100).toFixed(1)}%`);
        
        return isHealthy;
    }
    
    // 等待DOM加载完成后执行验证
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runValidation, 1000); // 给模块初始化一些时间
        });
    } else {
        setTimeout(runValidation, 1000);
    }
    
    // 暴露验证函数到全局作用域，方便手动调用
    window.validateModularSystem = runValidation;
    
})();