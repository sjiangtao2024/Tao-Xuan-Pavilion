/**
 * 产品媒体管理模块
 * 专门处理产品的图片和视频上传、预览、删除、缩略图设置等功能
 */

// 媒体管理状态
let currentProductMedia = [];
let uploadInProgress = false;
let thumbnailAssetId = null;

// 支持的文件类型
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 初始化媒体管理功能
 */
function initializeProductMedia() {
    console.log('产品媒体管理模块初始化');
    
    // 注入样式
    injectMediaStyles();
    
    // 渲染媒体界面
    const rendered = renderMediaInterface();
    if (!rendered) {
        // 容器不存在，等待后续调用
        console.log('产品媒体模块初始化暂缓，等待编辑器初始化');
        return false;
    }
    
    // 设置上传区域
    setupMediaUploadArea();
    
    return true;
}

/**
 * 渲染媒体界面
 */
function renderMediaInterface() {
    const container = document.getElementById('product-media-container');
    if (!container) {
        console.log('产品媒体容器未找到，等待后续初始化');
        return false;
    }
    
    const mediaHTML = `
        <div class="media-section">
            <div class="media-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #f39c12; font-size: 1.2em; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 8px;">
                    <span>🖼️</span>
                    <span>媒体文件</span>
                </h3>
                <button class="media-upload-btn" onclick="triggerMediaUpload()" style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; gap: 8px;">
                    <span>📁</span>
                    <span>上传</span>
                </button>
            </div>
            
            <div id="media-list" class="media-grid">
                <div class="empty-media-state">暂无媒体文件</div>
            </div>
            
            <div id="media-upload-area" class="media-upload-area">
                <div style="text-align: center; color: rgba(255,255,255,0.7);">
                    <div style="font-size: 2em; margin-bottom: 10px;">📁</div>
                    <div>点击或拖拽文件到此区域上传</div>
                    <div class="upload-info" style="font-size: 0.8em; margin-top: 10px;">支持 JPG, PNG, GIF, MP4 等格式，最大 10MB</div>
                </div>
            </div>
            
            <div id="upload-progress" class="upload-progress">
                <div id="upload-progress-bar" class="upload-progress-bar"></div>
            </div>
            
            <input type="file" id="media-upload-input" multiple accept="image/*,video/*" style="display: none;">
        </div>
    `;
    
    container.innerHTML = mediaHTML;
}

/**
 * 触发媒体上传
 */
function triggerMediaUpload() {
    const uploadInput = document.getElementById('media-upload-input');
    if (uploadInput) {
        uploadInput.click();
    }
}

/**
 * 注入媒体管理相关样式
 */
function injectMediaStyles() {
    const existingStyle = document.getElementById('product-media-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'product-media-styles';
    style.textContent = `
        .media-section {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .media-item {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .media-item:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(243, 156, 18, 0.5);
        }
        
        .media-item.thumbnail {
            border-color: #f39c12;
            background: rgba(243, 156, 18, 0.1);
        }
        
        .media-preview {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 5px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .media-preview video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .media-preview.file-icon {
            font-size: 2em;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .media-type-badge {
            position: absolute;
            top: 5px;
            left: 5px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
            font-weight: bold;
        }
        
        .thumbnail-badge {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #f39c12;
            color: black;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.7em;
            font-weight: bold;
        }
        
        .media-actions {
            display: flex;
            gap: 5px;
            justify-content: center;
            margin-top: 8px;
        }
        
        .media-btn {
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em;
            transition: all 0.3s;
            opacity: 0.8;
        }
        
        .media-btn:hover {
            opacity: 1;
            transform: translateY(-1px);
        }
        
        .media-btn.set-thumbnail {
            background: #f39c12;
            color: black;
        }
        
        .media-btn.delete {
            background: #e74c3c;
            color: white;
        }
        
        .media-upload-area {
            border: 2px dashed rgba(243, 156, 18, 0.5);
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin-top: 15px;
            transition: all 0.3s;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.02);
        }
        
        .media-upload-area:hover {
            border-color: #f39c12;
            background: rgba(243, 156, 18, 0.1);
        }
        
        .media-upload-area.dragover {
            border-color: #f39c12;
            background: rgba(243, 156, 18, 0.2);
            transform: scale(1.02);
        }
        
        .upload-progress {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin-top: 10px;
            overflow: hidden;
            display: none;
        }
        
        .upload-progress.show {
            display: block;
        }
        
        .upload-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #f39c12, #e67e22);
            width: 0;
            transition: width 0.3s;
            border-radius: 2px;
        }
        
        .upload-info {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        .media-filename {
            font-size: 0.8em;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .empty-media-state {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 40px 20px;
            font-style: italic;
        }
        
        .media-loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #f39c12;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 设置媒体上传区域
 */
function setupMediaUploadArea() {
    const uploadArea = document.getElementById('media-upload-area');
    const uploadInput = document.getElementById('media-upload-input');
    
    if (!uploadArea || !uploadInput) return;
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', (e) => {
        if (!uploadInProgress) {
            uploadInput.click();
        }
    });
    
    // 文件选择处理
    uploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(Array.from(e.target.files));
        }
    });
    
    // 拖拽上传功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (!uploadInProgress && e.dataTransfer.files.length > 0) {
            handleFileUpload(Array.from(e.dataTransfer.files));
        }
    });
}

/**
 * 处理文件上传
 * @param {File[]} files - 要上传的文件列表
 */
async function handleFileUpload(files) {
    if (uploadInProgress) {
        showNotification('上传正在进行中，请稍等...', 'warning');
        return;
    }
    
    // 验证文件
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
        return;
    }
    
    uploadInProgress = true;
    showUploadProgress(true);
    
    try {
        let successCount = 0;
        const totalFiles = validFiles.length;
        
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            updateUploadProgress((i / totalFiles) * 100, `上传 ${file.name}...`);
            
            try {
                const uploadResult = await uploadSingleFile(file);
                if (uploadResult.success) {
                    addMediaToList(uploadResult.data);
                    successCount++;
                }
            } catch (error) {
                console.error(`上传文件 ${file.name} 失败:`, error);
                showNotification(`上传 ${file.name} 失败: ${error.message}`, 'error');
            }
        }
        
        updateUploadProgress(100, `上传完成 (${successCount}/${totalFiles})`);
        
        setTimeout(() => {
            showUploadProgress(false);
            if (successCount > 0) {
                showNotification(`成功上传 ${successCount} 个文件`, 'success');
                renderMediaList();
            }
        }, 1000);
        
    } catch (error) {
        console.error('批量上传失败:', error);
        showNotification(`上传失败: ${error.message}`, 'error');
        showUploadProgress(false);
    } finally {
        uploadInProgress = false;
        // 清空文件输入
        const uploadInput = document.getElementById('media-upload-input');
        if (uploadInput) uploadInput.value = '';
    }
}

/**
 * 验证文件
 * @param {File[]} files - 文件列表
 * @returns {File[]} - 有效的文件列表
 */
function validateFiles(files) {
    const validFiles = [];
    
    for (const file of files) {
        // 检查文件类型
        const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
        const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
        
        if (!isImage && !isVideo) {
            showNotification(`不支持的文件类型: ${file.name}`, 'warning');
            continue;
        }
        
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
            showNotification(`文件过大: ${file.name} (最大${MAX_FILE_SIZE / 1024 / 1024}MB)`, 'warning');
            continue;
        }
        
        validFiles.push(file);
    }
    
    return validFiles;
}

/**
 * 上传单个文件
 * @param {File} file - 要上传的文件
 * @returns {Promise<Object>} - 上传结果
 */
async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');
    
    // 如果是编辑模式，添加产品ID
    const currentProductData = window.getCurrentProductData ? window.getCurrentProductData() : null;
    if (currentProductData && currentProductData.id) {
        formData.append('product_id', currentProductData.id);
    }
    
    const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '上传失败' }));
        throw new Error(errorData.error || `HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    return {
        success: true,
        data: {
            id: result.id || Date.now(),
            url: result.url,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            filename: file.name,
            size: file.size,
            is_thumbnail: currentProductMedia.length === 0 // 第一个文件设为缩略图
        }
    };
}

/**
 * 添加媒体到列表
 * @param {Object} mediaData - 媒体数据
 */
function addMediaToList(mediaData) {
    currentProductMedia.push(mediaData);
    
    // 如果是第一个媒体文件，自动设为缩略图
    if (currentProductMedia.length === 1) {
        setMediaAsThumbnail(mediaData.id);
    }
}

/**
 * 渲染媒体列表
 */
function renderMediaList() {
    const mediaList = document.getElementById('media-list');
    if (!mediaList) return;
    
    if (currentProductMedia.length === 0) {
        mediaList.innerHTML = '<div class="empty-media-state">暂无媒体文件</div>';
        return;
    }
    
    const mediaHTML = currentProductMedia.map((media, index) => {
        const isImage = media.type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(media.url);
        const isVideo = media.type === 'video' || /\.(mp4|mov|avi|webm)$/i.test(media.url);
        
        return `
            <div class="media-item ${media.is_thumbnail ? 'thumbnail' : ''}" 
                 data-media-id="${media.id || index}"
                 onclick="selectMediaItem(${media.id || index})">
                
                ${media.is_thumbnail ? '<div class="thumbnail-badge">缩略图</div>' : ''}
                <div class="media-type-badge">${isImage ? '图片' : isVideo ? '视频' : '文件'}</div>
                
                <div class="media-preview">
                    ${isImage ? `
                        <img src="${media.url}" alt="${media.filename || '产品图片'}" 
                             loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="media-preview file-icon" style="display: none;">🖼️</div>
                    ` : isVideo ? `
                        <video muted preload="metadata">
                            <source src="${media.url}" type="${media.type || 'video/mp4'}">
                            <div class="media-preview file-icon">🎥</div>
                        </video>
                    ` : `
                        <div class="media-preview file-icon">📄</div>
                    `}
                </div>
                
                <div class="media-filename" title="${media.filename || '未知文件'}">
                    ${media.filename || '未知文件'}
                </div>
                
                <div class="media-actions">
                    ${!media.is_thumbnail ? `
                        <button class="media-btn set-thumbnail" 
                                onclick="event.stopPropagation(); setMediaAsThumbnail(${media.id || index})" 
                                title="设为缩略图">
                            缩略图
                        </button>
                    ` : ''}
                    <button class="media-btn delete" 
                            onclick="event.stopPropagation(); deleteMediaItem(${media.id || index})" 
                            title="删除">
                        删除
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    mediaList.innerHTML = mediaHTML;
}

/**
 * 设置媒体文件为缩略图
 * @param {number} mediaId - 媒体ID
 */
function setMediaAsThumbnail(mediaId) {
    // 清除所有缩略图标记
    currentProductMedia.forEach(media => {
        media.is_thumbnail = false;
    });
    
    // 设置新的缩略图
    const media = currentProductMedia.find(m => (m.id || currentProductMedia.indexOf(m)) == mediaId);
    if (media) {
        media.is_thumbnail = true;
        thumbnailAssetId = media.id;
        
        showNotification('缩略图设置成功', 'success');
        renderMediaList();
    }
}

/**
 * 删除媒体文件
 * @param {number} mediaId - 媒体ID
 */
async function deleteMediaItem(mediaId) {
    if (!confirm('确定要删除这个媒体文件吗？')) return;
    
    try {
        const mediaIndex = currentProductMedia.findIndex(m => (m.id || currentProductMedia.indexOf(m)) == mediaId);
        if (mediaIndex === -1) return;
        
        const media = currentProductMedia[mediaIndex];
        
        // 如果是编辑模式且有真实的媒体ID，调用删除API
        if (media.id && window.checkIsEditMode && window.checkIsEditMode()) {
            const response = await fetch(`/api/admin/media/${media.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: '删除失败' }));
                throw new Error(errorData.error || '删除媒体文件失败');
            }
        }
        
        // 从本地列表中移除
        currentProductMedia.splice(mediaIndex, 1);
        
        // 如果删除的是缩略图，自动设置第一个为缩略图
        if (media.is_thumbnail && currentProductMedia.length > 0) {
            setMediaAsThumbnail(currentProductMedia[0].id || 0);
        }
        
        renderMediaList();
        showNotification('媒体文件删除成功', 'success');
        
    } catch (error) {
        console.error('删除媒体文件失败:', error);
        showNotification(`删除失败: ${error.message}`, 'error');
    }
}

/**
 * 选择媒体项
 * @param {number} mediaId - 媒体ID
 */
function selectMediaItem(mediaId) {
    // 移除所有选中状态
    document.querySelectorAll('.media-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加选中状态
    const mediaItem = document.querySelector(`[data-media-id="${mediaId}"]`);
    if (mediaItem) {
        mediaItem.classList.add('selected');
    }
}

/**
 * 显示上传进度
 * @param {boolean} show - 是否显示
 */
function showUploadProgress(show) {
    const progressContainer = document.getElementById('upload-progress');
    if (progressContainer) {
        if (show) {
            progressContainer.classList.add('show');
        } else {
            progressContainer.classList.remove('show');
        }
    }
}

/**
 * 更新上传进度
 * @param {number} percent - 进度百分比
 * @param {string} message - 进度消息
 */
function updateUploadProgress(percent, message) {
    const progressBar = document.getElementById('upload-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
    
    // 可以在这里更新进度文本
    const uploadArea = document.getElementById('media-upload-area');
    if (uploadArea && message) {
        const infoElement = uploadArea.querySelector('.upload-info');
        if (infoElement) {
            infoElement.textContent = message;
        }
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    // 添加样式动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * 获取当前产品媒体列表
 * @returns {Array} - 媒体列表
 */
function getCurrentProductMedia() {
    return [...currentProductMedia];
}

/**
 * 设置当前产品媒体列表
 * @param {Array} mediaList - 媒体列表
 */
function setCurrentProductMedia(mediaList) {
    currentProductMedia = [...(mediaList || [])];
    renderMediaList();
}

/**
 * 清空当前产品媒体列表
 */
function clearCurrentProductMedia() {
    currentProductMedia = [];
    thumbnailAssetId = null;
    renderMediaList();
}

/**
 * 获取缩略图资源ID
 * @returns {number|null} - 缩略图资源ID
 */
function getThumbnailAssetId() {
    return thumbnailAssetId;
}

// 导出函数供外部使用
if (typeof window !== 'undefined') {
    window.initializeProductMedia = initializeProductMedia;
    window.setMediaAsThumbnail = setMediaAsThumbnail;
    window.deleteMediaItem = deleteMediaItem;
    window.selectMediaItem = selectMediaItem;
    window.getCurrentProductMedia = getCurrentProductMedia;
    window.setCurrentProductMedia = setCurrentProductMedia;
    window.clearCurrentProductMedia = clearCurrentProductMedia;
    window.getThumbnailAssetId = getThumbnailAssetId;
}

// ES6 模块导出
export {
    initializeProductMedia,
    setMediaAsThumbnail,
    deleteMediaItem,
    selectMediaItem,
    getCurrentProductMedia,
    setCurrentProductMedia,
    clearCurrentProductMedia,
    getThumbnailAssetId
};

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeProductMedia,
        getCurrentProductMedia,
        setCurrentProductMedia,
        clearCurrentProductMedia,
        getThumbnailAssetId
    };
}