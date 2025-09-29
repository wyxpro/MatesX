const unionid = localStorage.getItem('unionid');
if (!unionid) throw new Error('用户未登录，请重新登录');

// 通用文件上传函数
const uploadFile = async ({ url, file, contentType }) => {
    const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 
            'Content-Type': contentType,
        }
    });

    if (!response.ok) {
        throw new Error(`${contentType} 上传失败，状态码：${response.status}`);
    }
    console.log(`${contentType.split('/')[1]} 上传成功`);
};  

class VoiceModal {
    constructor(onCreate) {
        this.onCreate = onCreate;
        this.isRecording = false;
        this.countdown = 20;
        this.countdownInterval = null;
        this.currentAudioFile = null;

        this.gumStream = null;        // stream from getUserMedia()
        this.rec = null;              // Recorder.js object
        this.input = null;            // MediaStreamAudioSourceNode we'll be recording
        this.audioContext = null;
        this.currentPreviewUrl = null; // 新增属性管理预览URL

        this.init();
    }

    async init() {
        // 加载HTML模板
        try {
            const response = await fetch('modal.html');
            if (!response.ok) throw new Error('Failed to load modal template');
            const html = await response.text();
            document.getElementById('modal-container').innerHTML = html;

            // 绑定事件
            this.bindEvents();
        } catch (error) {
            console.error('Error loading modal template:', error);
            this.showToast('加载模态框失败，请重试');
        }
    }

    bindEvents() {
        // 方法切换
        document.querySelector('.method-switch').addEventListener('click', (e) => {
            if (e.target.classList.contains('method-item')) {
                this.switchMethod(e.target.dataset.method);
            }
        });

        // 录音按钮
        document.getElementById('record-button').addEventListener('click', () => this.toggleRecording());

        // 上传
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // 提交按钮
        document.getElementById('submit-btn').addEventListener('click', () => this.handleSubmit());

        // 关闭按钮
        document.getElementById('close-modal-btn').addEventListener('click', () => this.hide());
    }

    show() {
        document.getElementById('modal').style.display = 'flex';
        this.switchMethod('record');
    }

    hide() {
        document.getElementById('modal').style.display = 'none';
        this.resetAll();
    }

    switchMethod(method) {
        document.querySelectorAll('.method-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        if (method === 'record') {
            document.getElementById('record-area').style.display = 'block';
            document.getElementById('upload-area').style.display = 'none';
            this.clearAudio();
        } else {
            document.getElementById('record-area').style.display = 'none';
            document.getElementById('upload-area').style.display = 'block';
            this.stopRecording();
        }
    }

    async toggleRecording() {
        if (!this.isRecording) {
            const constraints = { audio: true, video: false };
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
                this.recordingStartTime = Date.now(); // 记录录音开始时间
                this.isRecording = true;
                document.getElementById('record-button').classList.add('recording');
                this.startCountdown();

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                try {
                    this.audioContext = new AudioContext({ sampleRate: 16000 });
                } catch (e) {
                    console.error("无法创建16kHz的AudioContext，使用默认采样率。");
                    this.audioContext = new AudioContext();
                }
                console.log("当前采样率：", this.audioContext.sampleRate);

                this.gumStream = stream;
                this.input = this.audioContext.createMediaStreamSource(stream);

                this.rec = new Recorder(this.input, {
                    numChannels: 1,
                    sampleRate: 16000,   // 16kHz采样率
                    encoderBitRate: 16   // 16位深度
                });

                // start the recording process
                this.rec.record();
                console.log("Recording started");

            }).catch((err) => {
                this.showToast(`发生错误：${err.message}`);
            });
        } else {
            this.stopRecording();
        }
    }

    stopRecording() {
        if (this.rec) {
            this.rec.stop();
            this.isRecording = false;
            // stop microphone access
            if (this.gumStream && this.gumStream.getAudioTracks().length > 0) {
                this.gumStream.getAudioTracks()[0].stop();
            }

            const duration = Date.now() - this.recordingStartTime;
            // 检测录音时长
            if (duration < 8000) {
                this.showToast('录音时间不足8秒，请重新录制');
                document.getElementById('preview-audio').src = '';
                document.getElementById('record-button').classList.remove('recording');
                clearInterval(this.countdownInterval);
                this.countdown = 20;
                this.updateTimeDisplay();
                return;
            }

            this.rec.exportWAV((audioBlob) => {
                this.currentAudioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
                // 释放之前的预览URL
                if (this.currentPreviewUrl) {
                    URL.revokeObjectURL(this.currentPreviewUrl);
                }
                this.currentPreviewUrl = URL.createObjectURL(audioBlob);
                document.getElementById('preview-audio').src = this.currentPreviewUrl;
                document.getElementById('time-display').textContent = '录音完成';
                this.showAudioPreview();
                console.log("音频数据已保存到currentAudioFile", this.currentAudioFile.name);
            });

            document.getElementById('record-button').classList.remove('recording');
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    startCountdown() {
        this.countdown = 20;
        this.updateTimeDisplay();

        this.countdownInterval = setInterval(() => {
            this.countdown--;
            this.updateTimeDisplay();
            if (this.countdown <= 0) this.stopRecording();
        }, 1000);
    }

    updateTimeDisplay() {
        document.getElementById('time-display').textContent =
            `剩余时间：${this.countdown.toString().padStart(2, '0')}秒`;
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match(/audio\/(mpeg|wav|mp4|x-m4a)/)) {
            this.showToast('仅支持MP3/WAV/M4A格式');
            return;
        }

        // 检查文件大小是否超过10MB
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showToast('文件大小不能超过10MB');
            return;
        }
        const objectUrl = URL.createObjectURL(file); // 创建临时URL

        // 检查音频时长是否超过20秒
        const audio = new Audio();
        audio.src = objectUrl;
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(objectUrl); // 及时释放临时URL
            if (audio.duration < 8) {
                this.showToast('音频时长不能低于8秒');
                return;
            }
            if (audio.duration > 20) {
                this.showToast('音频时长不能超过20秒');
                return;
            }

            // 如果文件大小和时长都符合要求，继续处理
            this.currentAudioFile = file;
            this.showAudioPreview();
        };
        audio.onerror = () => {
            URL.revokeObjectURL(objectUrl); // 出错时释放
            this.showToast('无法读取音频文件');
        };
    }

    showAudioPreview() {
        // 释放之前的预览URL
        if (this.currentPreviewUrl) {
            URL.revokeObjectURL(this.currentPreviewUrl);
        }
        this.currentPreviewUrl = URL.createObjectURL(this.currentAudioFile);
        document.getElementById('preview-audio').src = this.currentPreviewUrl;
    }

    clearAudio() {
        document.getElementById('file-input').value = '';
        if (this.currentPreviewUrl) {
            URL.revokeObjectURL(this.currentPreviewUrl);
            this.currentPreviewUrl = null;
        }
        document.getElementById('preview-audio').src = '';
        this.currentAudioFile = null;
    }

    async handleSubmit() {
        const isUploadMode = document.querySelector('.method-item.active').dataset.method === 'upload';
        // 统一验证音频文件
        if (!this.currentAudioFile) {
            const errorMsg = isUploadMode ? '请先选择音频文件' : '请先录制音频';
            this.showToast(errorMsg);
            return;
        }

        // 二次验证音频时长（防止绕过前端检查）
        const objectUrl = URL.createObjectURL(this.currentAudioFile);
        const audio = new Audio();
        audio.src = objectUrl;

        try {
            const duration = await new Promise((resolve, reject) => {
                audio.onloadedmetadata = () => resolve(audio.duration);
                audio.onerror = () => reject(new Error('音频加载失败'));
            });

            if (duration < 8 || duration > 20) {
                this.showToast('音频时长需在8-20秒之间');
                return;
            }
        } catch (error) {
            this.showToast('处理音频失败: ' + error.message);
            return;
        } finally {
            URL.revokeObjectURL(objectUrl);
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '创建中...';

        let voice_id;
        let voice_name;
        let voice_balance;
        let voice_oss_url;
        let voice_url;

        const uploadToOSS = async (file, url_) => {
            try {
                let ext, contentType;

                if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
                    ext = 'mp3';
                    contentType = 'audio/mpeg';
                } else if (file.type === 'audio/mp4' || file.name.endsWith('.m4a')) {
                    ext = 'm4a';
                    contentType = 'audio/mp4';
                } else if (file.type === 'audio/wav' || file.name.endsWith('.wav')) {
                    ext = 'wav';
                    contentType = 'audio/wav';
                } else {
                    throw new Error('不支持的音频格式');
                }

                await uploadFile({
                    url: url_,
                    file: file,
                    contentType: contentType
                });

                console.log('音频文件上传成功');
            } catch (error) {
                console.error('上传失败:', error.message);
                throw error;
            }
        };

        // 访问服务器确认还有多少创建机会
        try {
            const response2 = await fetch('/voice/apply_new_voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unionid: unionid
                })
            });

            const result2 = await response2.json();
            console.log("apply_new_voice", result2.data)
            voice_id = result2.data.voice_id;
            voice_balance = result2.data.voice_balance;
            voice_name = result2.data.voice_name;
            voice_oss_url = result2.data.voice_oss_url;

            if (voice_balance < 1) {
                alert("语音克隆额度已不足");
                return;
            }

            console.log('开始上传语音');
            voice_url = `${voice_oss_url}/${voice_id}.${ext}`;
            await uploadToOSS(this.currentAudioFile, voice_url);

            const response = await fetch('/voice/handle_new_voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unionid: unionid,
                    voice_id: voice_id,
                    voice_url: voice_url,
                    voice_name: voice_name
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`[${error.code}] ${error.message}`);
            }

            const result = await response.json();
            if (result.code !== 0) {
                alert('任务提交失败');
                return;
            }

            alert(`上传成功，等待克隆中，您目前还有${voice_balance.toFixed(1)}次机会`);

            this.hide();
            console.log('renderVoiceList');

            const new_voice = {
                voice_id: voice_id,
                unionid: unionid,
                status: "pending",
                cosyvoice_id: "",
                voice_name: voice_name,
                voice_url: voice_url,
                clone_voice_url: ""
            };
            voices_list.push(new_voice);
            localStorage.setItem('voices_list', JSON.stringify(voices_list)); // 更新localStorage
            check_voice_status();
            this.showToast('声音创建成功！');
        } catch (error) {
            console.error('Error creating voice:', error);
            this.showToast('创建失败，请重试');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '开始创建';
        }
    }

    resetAll() {
        this.stopRecording();
        this.clearAudio();
        document.getElementById('time-display').textContent = '点击开始录音';
    }

    showToast(message, duration = 1500) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';

        // 添加动画效果
        toast.style.animation = 'toastIn 0.3s ease';

        // 在指定时间后隐藏 toast
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}