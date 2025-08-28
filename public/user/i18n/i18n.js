/**
 * 国际化管理系统
 * 处理多语言切换和文本翻译
 */

window.I18nManager = {
    // 模块初始化状态
    isInitialized: false,
    
    // 当前语言
    currentLang: window.APP_STATE.currentLang || 'en',
    
    // 翻译数据
    translations: {},
    
    // 初始化
    init: function() {
        // 加载翻译数据
        this.translations = {
            en: window.translations_en || {},
            zh: window.translations_zh || {}
        };
        
        // 设置当前语言
        this.setLanguage(this.currentLang);
        
        // 绑定语言切换事件
        this.bindLanguageSwitcher();
        
        // 监听语言变化事件
        window.EventUtils.on(window.APP_EVENTS.LANGUAGE_CHANGED, (event) => {
            this.updateAllTexts();
        });
        
        this.isInitialized = true;
        window.DEBUG_UTILS.log('i18n', 'I18n manager initialized', this.currentLang);
    },
    
    // 绑定语言切换器
    bindLanguageSwitcher: function() {
        const langZhBtn = window.DOMUtils.get('#lang-zh');
        const langEnBtn = window.DOMUtils.get('#lang-en');
        
        if (langZhBtn) {
            langZhBtn.addEventListener('click', () => {
                this.setLanguage('zh');
            });
        }
        
        if (langEnBtn) {
            langEnBtn.addEventListener('click', () => {
                this.setLanguage('en');
            });
        }
    },
    
    // 设置语言
    setLanguage: function(lang) {
        if (!this.translations[lang]) {
            window.DEBUG_UTILS.warn('i18n', 'Language not supported:', lang);
            return;
        }
        
        this.currentLang = lang;
        window.APP_STATE.currentLang = lang;
        
        // 保存到本地存储
        window.StorageUtils.set(window.APP_CONFIG.STORAGE_KEYS.LANGUAGE, lang);
        
        // 更新语言切换器状态
        this.updateLanguageSwitcher();
        
        // 更新所有文本
        this.updateAllTexts();
        
        // 触发语言变化事件
        window.EventUtils.emit(window.APP_EVENTS.LANGUAGE_CHANGED, lang);
        
        window.DEBUG_UTILS.log('i18n', 'Language changed to:', lang);
    },
    
    // 获取翻译文本
    t: function(key, defaultText = '') {
        const translation = this.translations[this.currentLang];
        if (translation && translation[key]) {
            return translation[key];
        }
        
        // 如果当前语言没有找到，尝试英文
        if (this.currentLang !== 'en' && this.translations.en && this.translations.en[key]) {
            return this.translations.en[key];
        }
        
        // 返回默认文本或键名
        return defaultText || key;
    },
    
    // 更新语言切换器状态
    updateLanguageSwitcher: function() {
        const langZhBtn = window.DOMUtils.get('#lang-zh');
        const langEnBtn = window.DOMUtils.get('#lang-en');
        
        if (langZhBtn && langEnBtn) {
            langZhBtn.classList.toggle('active', this.currentLang === 'zh');
            langEnBtn.classList.toggle('active', this.currentLang === 'en');
        }
    },
    
    // 更新所有带有 data-lang-key 属性的元素
    updateAllTexts: function() {
        const elements = window.DOMUtils.getAll('[data-lang-key]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const translatedText = this.t(key);
            
            if (translatedText) {
                // 根据元素类型设置文本
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'submit' || element.type === 'button') {
                        element.value = translatedText;
                    } else {
                        element.placeholder = translatedText;
                    }
                } else {
                    element.textContent = translatedText;
                }
            }
        });
        
        // 更新页面标题
        const titleKey = document.querySelector('title')?.getAttribute('data-lang-key');
        if (titleKey) {
            document.title = this.t(titleKey);
        }
        
        // 更新 HTML lang 属性
        document.documentElement.lang = this.currentLang;
        
        window.DEBUG_UTILS.log('i18n', 'All texts updated for language:', this.currentLang);
    },
    
    // 动态设置元素文本
    setText: function(element, key, defaultText = '') {
        if (typeof element === 'string') {
            element = window.DOMUtils.get(element);
        }
        
        if (element) {
            const translatedText = this.t(key, defaultText);
            element.textContent = translatedText;
            element.setAttribute('data-lang-key', key);
        }
    },
    
    // 动态设置元素属性文本
    setAttr: function(element, attribute, key, defaultText = '') {
        if (typeof element === 'string') {
            element = window.DOMUtils.get(element);
        }
        
        if (element) {
            const translatedText = this.t(key, defaultText);
            element.setAttribute(attribute, translatedText);
            element.setAttribute(`data-lang-${attribute}`, key);
        }
    },
    
    // 格式化文本（支持参数替换）
    format: function(key, params = {}, defaultText = '') {
        let text = this.t(key, defaultText);
        
        Object.keys(params).forEach(paramKey => {
            const placeholder = `{${paramKey}}`;
            text = text.replace(new RegExp(placeholder, 'g'), params[paramKey]);
        });
        
        return text;
    },
    
    // 获取当前语言
    getCurrentLanguage: function() {
        return this.currentLang;
    },
    
    // 检查是否支持某种语言
    isLanguageSupported: function(lang) {
        return !!this.translations[lang];
    },
    
    // 获取支持的语言列表
    getSupportedLanguages: function() {
        return Object.keys(this.translations);
    },
    
    // 获取当前语言的所有翻译
    getCurrentTranslations: function() {
        return this.translations[this.currentLang] || this.translations.en || {};
    }
};

// 全局翻译函数的简短别名
window.t = function(key, defaultText = '') {
    return window.I18nManager.t(key, defaultText);
};

// 格式化翻译函数的简短别名
window.tf = function(key, params = {}, defaultText = '') {
    return window.I18nManager.format(key, params, defaultText);
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.I18nManager.init();
});

window.DEBUG_UTILS.log('i18n', 'I18n system loaded');