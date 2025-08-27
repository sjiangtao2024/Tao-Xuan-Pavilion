/**
 * 产品表单管理模块
 * 专门处理双语产品表单的验证、数据绑定、提交等功能
 */

// 表单状态管理
let currentLanguage = 'zh';
let formData = {
    zh: { name: '', description: '' },
    en: { name: '', description: '' },
    price: '',
    categoryId: '',
    featured: false
};
let validationErrors = {};
let isFormDirty = false;

// 表单验证规则
const VALIDATION_RULES = {
    'product-name-zh': {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: '中文产品名称为必填项，长度为2-100个字符'
    },
    'product-name-en': {
        required: false,
        minLength: 2,
        maxLength: 100,
        message: '英文产品名称长度为2-100个字符'
    },
    'product-description-zh': {
        required: false,
        maxLength: 1000,
        message: '中文描述最多1000个字符'
    },
    'product-description-en': {
        required: false,
        maxLength: 1000,
        message: '英文描述最多1000个字符'
    },
    'product-price': {
        required: true,
        min: 0.01,
        max: 999999.99,
        type: 'number',
        message: '价格为必填项，范围为0.01-999999.99'
    }
};

/**
 * 初始化产品表单管理
 */
function initializeProductForm() {
    console.log('产品表单管理模块初始化');
    
    // 注入表单样式
    injectFormStyles();
    
    // 渲染表单界面
    const rendered = renderFormInterface();
    if (!rendered) {
        // 容器不存在，等待后续调用
        console.log('产品表单模块初始化暂缓，等待编辑器初始化');
        return false;
    }
    
    // 设置事件监听
    setupFormEventListeners();
    setupLanguageTabs();
    
    // 延迟加载分类，确保DOM元素已渲染
    setTimeout(() => {
        // 初始化时默认使用中文加载分类
        loadCategories(currentLanguage || 'zh');
    }, 100);
    
    return true;
}

/**
 * 渲染表单界面
 */
function renderFormInterface() {
    const container = document.getElementById('product-form-container');
    if (!container) {
        console.log('产品表单容器未找到，等待后续初始化');
        return false;
    }
    
    console.log('开始渲染产品表单界面...');
    
    const formHTML = `
        <!-- 语言切换器 -->
        <div class="language-tabs">
            <button class="language-tab active" onclick="switchLanguageTab('zh')">中文</button>
            <button class="language-tab" onclick="switchLanguageTab('en')">English</button>
        </div>
        
        <!-- 进度条 -->
        <div class="form-progress">
            <div class="form-progress-bar"></div>
        </div>
        
        <!-- 中文表单 -->
        <div id="zh-form-content" class="language-content active">
            <h3 style="color: #f39c12; margin-bottom: 20px;">🇨🇳 中文内容</h3>
            <div class="product-form-group">
                <label class="product-form-label required" for="product-name-zh">产品名称</label>
                <input type="text" id="product-name-zh" class="product-form-input" 
                       placeholder="请输入产品中文名称..." maxlength="100">
            </div>
            <div class="product-form-group">
                <label class="product-form-label" for="product-description-zh">产品描述</label>
                <textarea id="product-description-zh" class="product-form-textarea" 
                          placeholder="请输入产品中文描述..." maxlength="1000"></textarea>
            </div>
        </div>
        
        <!-- 英文表单 -->
        <div id="en-form-content" class="language-content">
            <h3 style="color: #f39c12; margin-bottom: 20px;">🇺🇸 English Content</h3>
            <div class="product-form-group">
                <label class="product-form-label" for="product-name-en">Product Name</label>
                <input type="text" id="product-name-en" class="product-form-input" 
                       placeholder="Enter product name in English..." maxlength="100">
            </div>
            <div class="product-form-group">
                <label class="product-form-label" for="product-description-en">Product Description</label>
                <textarea id="product-description-en" class="product-form-textarea" 
                          placeholder="Enter product description in English..." maxlength="1000"></textarea>
            </div>
        </div>
        
        <!-- 通用信息 -->
        <div class="general-info" style="background: rgba(255, 255, 255, 0.03); border-radius: 15px; padding: 25px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: #f39c12; margin-bottom: 20px;">⚙️ 通用信息</h3>
            <div class="form-row">
                <div class="product-form-group">
                    <label class="product-form-label required" for="product-price">价格 (USD)</label>
                    <input type="number" id="product-price" class="product-form-input" 
                           step="0.01" min="0" max="999999.99" placeholder="0.00">
                </div>
                <div class="product-form-group">
                    <label class="product-form-label" for="product-category">产品分类</label>
                    <select id="product-category" class="product-form-select">
                        <option value="">选择分类...</option>
                    </select>
                    <div class="category-loading">加载中...</div>
                </div>
                <div class="product-form-group form-full-row">
                    <label class="product-checkbox-group">
                        <input type="checkbox" id="product-featured" class="product-checkbox">
                        <span>精选产品</span>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="auto-save-indicator">自动保存中...</div>
    `;
    
    container.innerHTML = formHTML;
    
    // 验证DOM元素是否正确创建
    const requiredElements = [
        'product-name-zh', 'product-name-en',
        'product-description-zh', 'product-description-en',
        'product-price', 'product-category', 'product-featured'
    ];
    
    let missingElements = [];
    requiredElements.forEach(elementId => {
        if (!document.getElementById(elementId)) {
            missingElements.push(elementId);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('缺失DOM元素:', missingElements);
        return false;
    }
    
    console.log('产品表单界面渲染完成，所有必要元素均已创建');
    return true;
}

/**
 * 注入表单相关样式
 */
function injectFormStyles() {
    const existingStyle = document.getElementById('product-form-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'product-form-styles';
    style.textContent = `
        .language-tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid rgba(243, 156, 18, 0.3);
        }
        
        .language-tab {
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            color: #ffffff;
            cursor: pointer;
            border-radius: 8px 8px 0 0;
            margin-right: 5px;
            transition: all 0.3s;
            position: relative;
        }
        
        .language-tab:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .language-tab.active {
            background: #f39c12;
            color: #000000;
            font-weight: bold;
        }
        
        .language-tab.has-content::after {
            content: '●';
            position: absolute;
            top: 5px;
            right: 8px;
            font-size: 8px;
            color: #27ae60;
        }
        
        .language-content {
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .language-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .product-form-group {
            margin-bottom: 20px;
            position: relative;
        }
        
        .product-form-label {
            display: block;
            font-weight: bold;
            color: #f39c12;
            margin-bottom: 8px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .product-form-label.required::after {
            content: ' *';
            color: #e74c3c;
        }
        
        .product-form-input,
        .product-form-select,
        .product-form-textarea {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            font-size: 1em;
            transition: all 0.3s;
            box-sizing: border-box;
        }
        
        /* 专门为下拉框选项设置深色主题 */
        .product-form-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            background-repeat: no-repeat;
            background-position: right 15px center;
            background-size: 16px 12px;
            padding-right: 45px;
            cursor: pointer;
        }
        
        .product-form-select:hover {
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        }
        
        .product-form-select:focus {
            background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="%23f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        }
        
        .product-form-select option {
            background: #2c2c2c;
            color: #ffffff;
            padding: 8px 12px;
            border: none;
        }
        
        .product-form-select option:hover {
            background: #3a3a3a;
        }
        
        .product-form-select option:checked {
            background: #f39c12;
            color: #000000;
        }
        
        /* 针对不同浏览器的兼容性处理 */
        .product-form-select optgroup {
            background: #2c2c2c;
            color: #f39c12;
            font-weight: bold;
        }
        
        .product-form-input:focus,
        .product-form-select:focus,
        .product-form-textarea:focus {
            outline: none;
            border-color: #f39c12;
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
        }
        
        .product-form-input.error,
        .product-form-select.error,
        .product-form-textarea.error {
            border-color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
        }
        
        .product-form-input.valid,
        .product-form-select.valid,
        .product-form-textarea.valid {
            border-color: #27ae60;
            background: rgba(39, 174, 96, 0.1);
        }
        
        .product-form-textarea {
            min-height: 80px;
            resize: vertical;
            font-family: inherit;
        }
        
        .form-error {
            color: #e74c3c;
            font-size: 0.8em;
            margin-top: 5px;
            display: block;
            animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .character-counter {
            position: absolute;
            bottom: -20px;
            right: 0;
            font-size: 0.7em;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .character-counter.warning {
            color: #f39c12;
        }
        
        .character-counter.error {
            color: #e74c3c;
        }
        
        .product-checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .product-checkbox {
            width: 20px;
            height: 20px;
            accent-color: #f39c12;
            cursor: pointer;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .form-full-row {
            grid-column: 1 / -1;
        }
        
        .category-loading {
            display: none;
            color: rgba(255, 255, 255, 0.6);
            font-style: italic;
        }
        
        .auto-save-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            color: #27ae60;
            font-size: 0.8em;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .auto-save-indicator.show {
            opacity: 1;
        }
        
        .form-progress {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .form-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #f39c12, #e67e22);
            width: 0;
            transition: width 0.3s;
            border-radius: 2px;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .language-tab {
                padding: 10px 15px;
                font-size: 0.9em;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 设置表单事件监听器
 */
function setupFormEventListeners() {
    // 为所有表单输入添加事件监听
    const formInputs = document.querySelectorAll('.product-form-input, .product-form-select, .product-form-textarea');
    
    formInputs.forEach(input => {
        // 实时验证
        input.addEventListener('blur', () => validateField(input.id));
        input.addEventListener('input', () => {
            handleInputChange(input);
            updateFormProgress();
        });
        
        // 字符计数器
        if (input.tagName === 'TEXTAREA' || input.maxLength) {
            input.addEventListener('input', () => updateCharacterCounter(input.id));
        }
    });
    
    // 复选框事件
    const checkbox = document.getElementById('product-featured');
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            formData.featured = checkbox.checked;
            isFormDirty = true;
        });
    }
}

/**
 * 设置语言标签切换
 */
function setupLanguageTabs() {
    const tabs = document.querySelectorAll('.language-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const language = tab.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (language) {
                switchLanguage(language);
            }
        });
    });
}

/**
 * 处理输入变化
 * @param {HTMLElement} input - 输入元素
 */
function handleInputChange(input) {
    const value = input.value.trim();
    isFormDirty = true;
    
    // 注意：不在这里自动保存数据到formData
    // 数据保存在语言切换时进行，或者在表单提交时进行
    
    // 更新语言标签状态
    updateLanguageTabStatus();
    
    // 清除验证错误（如果有）
    clearFieldError(input.id);
    
    // 自动保存指示器
    showAutoSaveIndicator();
}

/**
 * 切换语言
 * @param {string} language - 语言代码
 */
async function switchLanguage(language) {
    console.log(`切换语言到: ${language}，当前语言: ${currentLanguage}`);
    
    // 在切换前，先保存当前语言标签的数据
    saveCurrentLanguageData();
    
    // 更新当前语言
    const previousLanguage = currentLanguage;
    currentLanguage = language;
    
    // 更新标签页状态
    console.log('更新语言标签状态...');
    document.querySelectorAll('.language-tab').forEach(tab => {
        tab.classList.remove('active');
        console.log(`移除标签 active 类: ${tab.textContent}`);
    });
    
    const activeTab = document.querySelector(`[onclick*="${language}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        console.log(`激活标签: ${activeTab.textContent}`);
    } else {
        console.error(`找不到语言标签: ${language}`);
    }
    
    // 更新内容显示
    console.log('更新语言内容显示...');
    document.querySelectorAll('.language-content').forEach(content => {
        content.classList.remove('active');
        console.log(`隐藏内容区域: ${content.id}`);
    });
    
    const targetContent = document.getElementById(`${language}-form-content`);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log(`显示内容区域: ${targetContent.id}`);
        
        // 检查内容区域的显示状态
        const computedStyle = window.getComputedStyle(targetContent);
        console.log(`${targetContent.id} 的 display 状态: ${computedStyle.display}`);
    } else {
        console.error(`找不到语言内容区域: ${language}-form-content`);
        
        // 列出所有可用的语言内容区域
        const allContents = document.querySelectorAll('.language-content');
        console.log('所有可用的语言内容区域:');
        allContents.forEach(content => {
            console.log(`- ${content.id}: ${content.classList.contains('active') ? 'active' : 'inactive'}`);
        });
    }
    
    // 恢复当前语言的数据到表单
    restoreLanguageData(language);
    
    // 重新加载分类（根据当前语言）
    await loadCategories(language);
    
    console.log(`语言切换完成: ${previousLanguage} -> ${language}`);
    console.log('当前formData:', formData);
}

/**
 * 保存当前语言标签的数据
 */
function saveCurrentLanguageData() {
    if (!currentLanguage) return;
    
    console.log(`保存 ${currentLanguage} 语言数据...`);
    
    if (currentLanguage === 'zh') {
        const nameInput = document.getElementById('product-name-zh');
        const descInput = document.getElementById('product-description-zh');
        
        if (nameInput) {
            formData.zh.name = nameInput.value || '';
            console.log(`保存中文名称: "${formData.zh.name}"`);
        }
        if (descInput) {
            formData.zh.description = descInput.value || '';
            console.log(`保存中文描述: "${formData.zh.description}"`);
        }
    } else if (currentLanguage === 'en') {
        const nameInput = document.getElementById('product-name-en');
        const descInput = document.getElementById('product-description-en');
        
        if (nameInput) {
            formData.en.name = nameInput.value || '';
            console.log(`保存英文名称: "${formData.en.name}"`);
        }
        if (descInput) {
            formData.en.description = descInput.value || '';
            console.log(`保存英文描述: "${formData.en.description}"`);
        }
    }
    
    // 保存通用字段（价格、分类等）
    const priceInput = document.getElementById('product-price');
    const categorySelect = document.getElementById('product-category');
    const featuredCheckbox = document.getElementById('product-featured');
    
    if (priceInput) {
        formData.price = priceInput.value || '';
    }
    if (categorySelect) {
        formData.categoryId = categorySelect.value || '';
    }
    if (featuredCheckbox) {
        formData.featured = featuredCheckbox.checked;
    }
}

/**
 * 恢复指定语言的数据到表单
 * @param {string} language - 语言代码
 */
function restoreLanguageData(language) {
    console.log(`恢复 ${language} 语言数据...`);
    console.log('当前formData:', JSON.stringify(formData, null, 2));
    
    // 使用setTimeout确保 DOM元素已经渲染完成
    setTimeout(() => {
        if (language === 'zh') {
            const nameInput = document.getElementById('product-name-zh');
            const descInput = document.getElementById('product-description-zh');
            
            if (nameInput) {
                nameInput.value = formData.zh.name || '';
                console.log(`恢复中文名称: "${nameInput.value}"`);
            } else {
                console.error('中文名称输入框未找到');
            }
            if (descInput) {
                descInput.value = formData.zh.description || '';
                console.log(`恢复中文描述: "${descInput.value}"`);
            } else {
                console.error('中文描述输入框未找到');
            }
        } else if (language === 'en') {
            const nameInput = document.getElementById('product-name-en');
            const descInput = document.getElementById('product-description-en');
            
            if (nameInput) {
                nameInput.value = formData.en.name || '';
                console.log(`恢复英文名称: "${nameInput.value}"`);
            } else {
                console.error('英文名称输入框未找到');
            }
            if (descInput) {
                descInput.value = formData.en.description || '';
                console.log(`恢复英文描述: "${descInput.value}"`);
            } else {
                console.error('英文描述输入框未找到');
            }
        }
        
        // 恢复通用字段
        const priceInput = document.getElementById('product-price');
        const categorySelect = document.getElementById('product-category');
        const featuredCheckbox = document.getElementById('product-featured');
        
        if (priceInput) {
            priceInput.value = formData.price || '';
            console.log(`恢复价格: "${priceInput.value}"`);
        }
        if (categorySelect) {
            categorySelect.value = formData.categoryId || '';
            console.log(`恢复分类: "${categorySelect.value}"`);
        }
        if (featuredCheckbox) {
            featuredCheckbox.checked = formData.featured || false;
            console.log(`恢复精选状态: ${featuredCheckbox.checked}`);
        }
        
        // 更新字符计数器
        updateAllCharacterCounters();
        
        // 更新语言标签状态
        updateLanguageTabStatus();
        
        console.log(`${language} 语言数据恢复完成`);
    }, 50); // 延迟50ms确保DOM元素可用
}

/**
 * 更新语言标签状态
 */
function updateLanguageTabStatus() {
    // 检查中文内容（根据DOM输入值）
    const zhTab = document.querySelector('[onclick*="zh"]');
    if (zhTab) {
        const zhNameInput = document.getElementById('product-name-zh');
        const zhDescInput = document.getElementById('product-description-zh');
        
        const hasZhContent = (zhNameInput && zhNameInput.value.trim()) || 
                           (zhDescInput && zhDescInput.value.trim());
        
        if (hasZhContent) {
            zhTab.classList.add('has-content');
        } else {
            zhTab.classList.remove('has-content');
        }
    }
    
    // 检查英文内容（根据DOM输入值）
    const enTab = document.querySelector('[onclick*="en"]');
    if (enTab) {
        const enNameInput = document.getElementById('product-name-en');
        const enDescInput = document.getElementById('product-description-en');
        
        const hasEnContent = (enNameInput && enNameInput.value.trim()) || 
                           (enDescInput && enDescInput.value.trim());
        
        if (hasEnContent) {
            enTab.classList.add('has-content');
        } else {
            enTab.classList.remove('has-content');
        }
    }
}

/**
 * 验证字段
 * @param {string} fieldId - 字段ID
 * @returns {boolean} - 验证结果
 */
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    
    const rule = VALIDATION_RULES[fieldId];
    if (!rule) return true;
    
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // 必填验证
    if (rule.required && !value) {
        isValid = false;
        errorMessage = rule.message;
    }
    
    // 长度验证
    if (value && rule.minLength && value.length < rule.minLength) {
        isValid = false;
        errorMessage = rule.message;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
        isValid = false;
        errorMessage = rule.message;
    }
    
    // 数字验证
    if (rule.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            isValid = false;
            errorMessage = '请输入有效的数字';
        } else if (rule.min && numValue < rule.min) {
            isValid = false;
            errorMessage = rule.message;
        } else if (rule.max && numValue > rule.max) {
            isValid = false;
            errorMessage = rule.message;
        }
    }
    
    // 更新UI
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
        clearFieldError(fieldId);
        delete validationErrors[fieldId];
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
        showFieldError(fieldId, errorMessage);
        validationErrors[fieldId] = errorMessage;
    }
    
    updateFormProgress();
    return isValid;
}

/**
 * 显示字段错误
 * @param {string} fieldId - 字段ID
 * @param {string} message - 错误消息
 */
function showFieldError(fieldId, message) {
    clearFieldError(fieldId);
    
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const errorElement = document.createElement('span');
    errorElement.className = 'form-error';
    errorElement.id = `${fieldId}-error`;
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

/**
 * 清除字段错误
 * @param {string} fieldId - 字段ID
 */
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * 更新所有字符计数器
 */
function updateAllCharacterCounters() {
    const inputsWithCounters = [
        'product-name-zh', 'product-name-en',
        'product-description-zh', 'product-description-en'
    ];
    
    inputsWithCounters.forEach(inputId => {
        updateCharacterCounter(inputId);
    });
}

/**
 * 更新字符计数器
 * @param {string} fieldId - 字段ID
 */
function updateCharacterCounter(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const rule = VALIDATION_RULES[fieldId];
    if (!rule || !rule.maxLength) return;
    
    const currentLength = field.value.length;
    const maxLength = rule.maxLength;
    
    let counter = document.querySelector(`#${fieldId} + .character-counter`);
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'character-counter';
        field.parentNode.appendChild(counter);
    }
    
    counter.textContent = `${currentLength}/${maxLength}`;
    
    // 更新样式
    counter.classList.remove('warning', 'error');
    if (currentLength > maxLength) {
        counter.classList.add('error');
    } else if (currentLength > maxLength * 0.8) {
        counter.classList.add('warning');
    }
}

/**
 * 加载产品分类
 * @param {string} language - 语言代码（zh 或 en）
 */
async function loadCategories(language = 'zh') {
    const categorySelect = document.getElementById('product-category');
    const loadingIndicator = document.querySelector('.category-loading');
    
    if (!categorySelect) return;
    
    console.log(`加载分类列表，语言: ${language}`);
    
    try {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        const response = await fetch(`/api/products/categories?lang=${language}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const categories = await response.json();
            
            // 保存当前选中的分类 ID
            const selectedCategoryId = categorySelect.value;
            
            // 清空现有选项（保留默认选项）
            const defaultText = language === 'zh' ? '选择分类...' : 'Select Category...';
            categorySelect.innerHTML = `<option value="">${defaultText}</option>`;
            
            // 添加分类选项
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            
            // 恢复之前选中的分类
            if (selectedCategoryId) {
                categorySelect.value = selectedCategoryId;
            }
            
            console.log(`成功加载 ${categories.length} 个分类（${language}）`);
        } else {
            console.warn('加载分类失败:', response.status);
        }
    } catch (error) {
        console.error('加载分类出错:', error);
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

/**
 * 刷新分类列表（供外部调用）
 */
async function refreshCategories() {
    console.log('刷新分类列表...');
    await loadCategories(currentLanguage || 'zh');
}

/**
 * 验证整个表单
 * @returns {boolean} - 验证结果
 */
function validateForm() {
    let isValid = true;
    
    // 验证所有字段
    Object.keys(VALIDATION_RULES).forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * 获取表单数据
 * @returns {Object} - 表单数据
 */
function getFormData() {
    // 确保获取最新的输入值
    syncFormData();
    
    return {
        name_zh: formData.zh.name || '',
        name_en: formData.en.name || '',
        description_zh: formData.zh.description || '',
        description_en: formData.en.description || '',
        price: parseFloat(formData.price) || 0,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        featured: formData.featured || false,
        media: window.getCurrentProductMedia ? window.getCurrentProductMedia() : []
    };
}

/**
 * 同步表单数据
 */
function syncFormData() {
    // 同步所有输入字段的当前值
    const inputs = {
        'product-name-zh': 'zh.name',
        'product-name-en': 'en.name',
        'product-description-zh': 'zh.description',
        'product-description-en': 'en.description',
        'product-price': 'price',
        'product-category': 'categoryId'
    };
    
    Object.keys(inputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            const path = inputs[inputId].split('.');
            if (path.length === 2) {
                formData[path[0]][path[1]] = input.value.trim();
            } else {
                formData[path[0]] = input.value.trim();
            }
        }
    });
    
    // 同步复选框
    const checkbox = document.getElementById('product-featured');
    if (checkbox) {
        formData.featured = checkbox.checked;
    }
}

/**
 * 填充表单数据
 * @param {Object} data - 产品数据
 */
function populateFormData(data) {
    if (!data) {
        console.log('没有数据需要填充');
        return;
    }
    
    console.log('开始填充表单数据:', data);
    
    // 重置表单数据
    formData = {
        zh: { name: '', description: '' },
        en: { name: '', description: '' },
        price: '',
        categoryId: '',
        featured: false
    };
    
    // 填充数据
    formData.zh.name = data.name_zh || '';
    formData.zh.description = data.description_zh || '';
    formData.en.name = data.name_en || '';
    formData.en.description = data.description_en || '';
    formData.price = data.price || '';
    formData.categoryId = data.categoryId || '';
    formData.featured = data.featured || false;
    
    console.log('数据填充到formData对象:', JSON.stringify(formData, null, 2));
    
    // 延迟更新UI，确保DOM元素完全初始化
    setTimeout(() => {
        console.log('开始更新UI...');
        updateFormUI();
        updateLanguageTabStatus();
        updateFormProgress();
        console.log('表单数据填充完成');
    }, 100); // 延迟100ms
    
    isFormDirty = false;
}

/**
 * 更新表单UI
 */
function updateFormUI() {
    console.log('更新表单UI，当前formData:', formData);
    
    // 更新输入字段
    const inputs = {
        'product-name-zh': formData.zh.name,
        'product-name-en': formData.en.name,
        'product-description-zh': formData.zh.description,
        'product-description-en': formData.en.description,
        'product-price': formData.price,
        'product-category': formData.categoryId
    };
    
    let foundElements = 0;
    let updatedElements = 0;
    
    Object.keys(inputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            foundElements++;
            const oldValue = input.value;
            input.value = inputs[inputId] || '';
            if (oldValue !== input.value) {
                updatedElements++;
                console.log(`已更新 ${inputId}: "${oldValue}" -> "${input.value}"`);
            }
            updateCharacterCounter(inputId);
        } else {
            console.warn(`DOM元素未找到: ${inputId}`);
        }
    });
    
    console.log(`表单UI更新完成: 找到${foundElements}个元素，更新${updatedElements}个元素`);
    
    // 更新复选框
    const checkbox = document.getElementById('product-featured');
    if (checkbox) {
        const oldChecked = checkbox.checked;
        checkbox.checked = formData.featured;
        if (oldChecked !== checkbox.checked) {
            console.log(`已更新精选状态: ${oldChecked} -> ${checkbox.checked}`);
        }
    } else {
        console.warn('精选复选框元素未找到: product-featured');
    }
}

/**
 * 重置表单
 */
function resetForm() {
    formData = {
        zh: { name: '', description: '' },
        en: { name: '', description: '' },
        price: '',
        categoryId: '',
        featured: false
    };
    
    validationErrors = {};
    isFormDirty = false;
    
    // 清除所有字段的样式和错误
    document.querySelectorAll('.product-form-input, .product-form-select, .product-form-textarea').forEach(input => {
        input.classList.remove('error', 'valid');
        clearFieldError(input.id);
    });
    
    // 重置UI
    updateFormUI();
    updateLanguageTabStatus();
    updateFormProgress();
    
    // 切换到中文标签
    switchLanguage('zh');
}

/**
 * 更新表单进度
 */
function updateFormProgress() {
    const progressBar = document.querySelector('.form-progress-bar');
    if (!progressBar) return;
    
    const requiredFields = ['product-name-zh', 'product-price'];
    const optionalFields = ['product-name-en', 'product-description-zh', 'product-description-en', 'product-category'];
    
    let filledRequired = 0;
    let filledOptional = 0;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim()) {
            filledRequired++;
        }
    });
    
    optionalFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim()) {
            filledOptional++;
        }
    });
    
    // 计算进度：必填字段占70%，可选字段占30%
    const requiredProgress = (filledRequired / requiredFields.length) * 70;
    const optionalProgress = (filledOptional / optionalFields.length) * 30;
    const totalProgress = requiredProgress + optionalProgress;
    
    progressBar.style.width = `${totalProgress}%`;
}

/**
 * 显示自动保存指示器
 */
function showAutoSaveIndicator() {
    const indicator = document.querySelector('.auto-save-indicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

/**
 * 检查表单是否有变更
 * @returns {boolean} - 是否有变更
 */
function isFormModified() {
    return isFormDirty;
}

/**
 * 获取验证错误
 * @returns {Object} - 验证错误对象
 */
function getValidationErrors() {
    return { ...validationErrors };
}

// 导出函数供外部使用
if (typeof window !== 'undefined') {
    window.initializeProductForm = initializeProductForm;
    window.switchLanguageTab = switchLanguage; // 兼容旧函数名
    window.switchLanguage = switchLanguage; // 新增：直接暴露switchLanguage函数
    window.validateProductForm = validateForm;
    window.getProductFormData = getFormData;
    window.populateProductFormData = populateFormData;
    window.resetProductForm = resetForm;
    window.isProductFormModified = isFormModified;
    window.getProductFormValidationErrors = getValidationErrors;
    window.refreshCategories = refreshCategories; // 新增：刷新分类函数
}

// ES6 模块导出
export {
    initializeProductForm,
    switchLanguage as switchLanguageTab,
    validateForm,
    getFormData,
    populateFormData,
    resetForm,
    isFormModified as isProductFormModified,
    getValidationErrors,
    refreshCategories
};

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeProductForm,
        validateForm,
        getFormData,
        populateFormData,
        resetForm,
        isFormModified,
        getValidationErrors
    };
}