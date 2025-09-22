let currentPreviewUrl = null;
let unionid = localStorage.getItem('unionid');
let avatar_id;
let isUploading = false;

let currentMode = 'image';
let currentFile = null;

// DOM元素
const modeButtons = document.querySelectorAll('.mode-btn');
const uploadArea = document.getElementById('uploadContainer');
const fileInput = document.getElementById('fileInput');
const uploadText = document.getElementById('uploadText');
const requirementsText = document.getElementById('requirementsText');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const previewContainer = document.getElementById('previewContainer');
const progressBar = document.getElementById('progressBar');
const createBtn = document.getElementById('createBtn');
const loadingText = document.getElementById('loadingText');
const backBtn = document.querySelector('.back-btn');

const removeBgCheckbox = document.getElementById('removeBgCheckbox');

// 返回按钮处理
function handleBack() {
    if (isUploading) {
        confirm('视频上传中，请等待完成后再操作');
        return;
    }
    if (confirm('确定要放弃当前编辑内容吗？')) {
        history.back();
    }
}

// 模式切换
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有active类
        modeButtons.forEach(btn => btn.classList.remove('active'));
        // 添加active类到当前按钮
        button.classList.add('active');
        
        // 更新当前模式
        currentMode = button.dataset.mode;
        
        // 更新上传区域UI
        updateUploadUI();
        
        // 重置文件输入
        resetFileInput();
    });
});

// 更新上传UI
function updateUploadUI() {
    if (currentMode === 'image') {
        uploadText.textContent = '点击上传人物图片';
        fileInput.disabled = false;
        fileInput.accept = 'image/*';
        requirementsText.innerHTML = `
            <p>• 仅支持竖屏，比例为9:16 </p>
            <p>• 以上面的人物头像大小作为参照</p>
            <p>• 请面部保持平静，不要张嘴</p>
            <p>• 图片支持：JPG/PNG格式，图片大小在5MB以下</p>
        `;
        uploadArea.classList.remove('disabled');
    } else if (currentMode === 'video'){
        uploadText.textContent = '点击上传人物视频';
        fileInput.disabled = false;
        fileInput.accept = 'video/*';
        requirementsText.innerHTML = `
            <p>• 以上面的人物头像大小作为参照</p>
            <p>• 请面部保持平静，不要张嘴</p>
            <p>• 视频支持：MP4/MOV格式，大小在25MB以下</p>
        `;
        uploadArea.classList.remove('disabled');
    } else if (currentMode === '3d'){
        uploadText.textContent = '即将开放';
        fileInput.disabled = true;
        fileInput.accept = ''; // 可选：清空或保持默认
        requirementsText.innerHTML = '<p>3D模式即将开放，敬请期待！</p>';
        uploadArea.classList.add('disabled');
    }
}

// 重置文件输入
function resetFileInput() {
    fileInput.value = '';
    previewContainer.style.display = 'none';
    imagePreview.style.display = 'none';
    videoPreview.style.display = 'none';
    
    if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = null;
    }
    
    currentFile = null;
    createBtn.disabled = true;
    fileInput.style.display = 'block';
}

// 文件选择处理
fileInput.addEventListener('change', handleFileSelect);

async function handleFileSelect(event) {
    if (currentMode === '3d') {
        return;
    }
    const file = event.target.files[0];
    if (!file) return;
    
    currentFile = file;
    createBtn.disabled = false;
    
    // 验证文件
    if (!validateFile(file)) {
        return;
    }
    
    // 创建预览URL
    currentPreviewUrl = URL.createObjectURL(file);
    
    // 显示预览
    if (currentMode === 'image') {
        imagePreview.src = currentPreviewUrl;
        imagePreview.style.display = 'block';
        videoPreview.style.display = 'none';

        // 截取画面作为缩略图
        const thumbnailFile = await createImageThumbnail(file);
        window.thumbnailFile = thumbnailFile;
    } else {
        videoPreview.src = currentPreviewUrl;
        videoPreview.style.display = 'block';
        imagePreview.style.display = 'none';
        // 截取第一帧
        const thumbnailFile = await captureFirstFrame(videoPreview);
        window.thumbnailFile = thumbnailFile;
    }
    
    previewContainer.style.display = 'block';
    fileInput.style.display = 'none';
}

// 文件验证
function validateFile(file) {
    if (currentMode === 'image') {
        // 验证图片
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            XSAlert('请上传JPG或PNG格式的图片');
            resetFileInput();
            return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            XSAlert('图片大小不能超过5MB');
            resetFileInput();
            return false;
        }
        
        return true;
    } else {
        // 验证视频
        if (!file.type.match('video/mp4') && !file.type.match('video/quicktime')) {
            XSAlert('请上传MP4或MOV格式的视频');
            resetFileInput();
            return false;
        }
        
        if (file.size > 25 * 1024 * 1024) {
            XSAlert('视频大小不能超过25MB');
            resetFileInput();
            return false;
        }
        
        return true;
    }
}

// 创建角色
createBtn.addEventListener('click', handleCreate);

async function handleCreate() {
    if (!currentFile) {
        XSAlert('请先上传文件');
        return;
    }
    
    const avatar_name = document.getElementById('avatar_name').value.trim();
    if (!avatar_name) {
        XSAlert('请输入角色名称');
        return;
    }

    unionid = localStorage.getItem('unionid');
    isUploading = true;
    setCreateButtonState(true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    try {
        // 成功处理
        confirm(`上传成功，等待生成中`);
        await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
        console.error('请求异常:', error);
        XSAlert('网络请求失败，请检查连接');
    } finally {
        cleanupUploadState();
    }
}

// 创建按钮状态管理
function setCreateButtonState(isUploading) {
    createBtn.disabled = isUploading;
    createBtn.innerHTML = isUploading 
        ? `<span class="spinner-border spinner-border-sm"></span> 上传中...`
        : '创建';
}

// 上传完成后的清理
function cleanupUploadState() {
    isUploading = false;
    window.removeEventListener('beforeunload', handleBeforeUnload);
    setCreateButtonState(false); // 解除按钮禁用
}

// 页面离开拦截
function handleBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = '图片或视频正在上传中，离开会导致上传中断，确定要离开吗？';
}

const getContentType = (file) => {
    if (file.type) return file.type; // 优先使用浏览器检测的type
    if (file.name.endsWith('.mov')) return 'video/quicktime';
    if (file.name.endsWith('.mp4')) return 'video/mp4';
    return 'application/octet-stream'; // 默认类型
};

async function createImageThumbnail(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 目标尺寸
            const targetWidth = 270;
            const targetHeight = 480;
            
            // 计算裁剪区域以保持比例
            const sourceAspect = img.width / img.height;
            const targetAspect = targetWidth / targetHeight;
            
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;
            
            if (sourceAspect > targetAspect) {
                // 源图像更宽，裁剪左右
                sourceWidth = img.height * targetAspect;
                sourceX = (img.width - sourceWidth) / 2;
            } else {
                // 源图像更高，裁剪上下
                sourceHeight = img.width / targetAspect;
                sourceY = (img.height - sourceHeight) / 2;
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // 绘制缩略图（裁剪并缩放）
            ctx.drawImage(
                img, 
                sourceX, sourceY, sourceWidth, sourceHeight, // 源裁剪区域
                0, 0, targetWidth, targetHeight              // 目标尺寸
            );
            
            // 转换为Blob对象
            canvas.toBlob((blob) => {
                const thumbnailFile = new File([blob], 'thumbnail_' + file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                URL.revokeObjectURL(img.src); // 释放内存
                resolve(thumbnailFile);
            }, 'image/jpeg', 0.85); // 0.85是JPEG质量
        };
    });
}

function captureFirstFrame(video) {
    return new Promise((resolve, reject) => {
        video.currentTime = 0; // 定位到第一帧
        
        video.addEventListener('loadeddata', function () {
            // 创建canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 计算缩放尺寸
            const maxSize = 360;
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round(height * maxSize / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round(width * maxSize / height);
                    height = maxSize;
                }
            }
            
            // 设置canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制视频帧
            ctx.drawImage(video, 0, 0, width, height);
            
            // 转换为JPG文件
            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('Canvas转换失败'));
                resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.8);
        });
    });
}

// 初始化
updateUploadUI();