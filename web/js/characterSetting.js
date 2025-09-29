// 音色数据
const officialVoices = [
    { voice_name: "韵婉", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240830/dzkngm/%E9%BE%99%E5%A9%89.mp3", voice_id: "longwan", cosyvoice_id: "longwan", status: "success" },
    { voice_name: "曦橙", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240830/ggjwfl/%E9%BE%99%E6%A9%98.wav", voice_id: "longcheng", cosyvoice_id: "longcheng", status: "success" },
    { voice_name: "宸华", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240830/jpjtvy/%E9%BE%99%E5%8D%8E.wav", voice_id: "longhua", cosyvoice_id: "longhua", status: "success" },
    { voice_name: "清和", language: "中英", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/rlfvcd/%E9%BE%99%E5%B0%8F%E6%B7%B3.mp3", voice_id: "longxiaochun", cosyvoice_id: "longxiaochun", status: "success" },
    { voice_name: "夏岚", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/wzywtu/%E9%BE%99%E5%B0%8F%E5%A4%8F.mp3", voice_id: "longxiaoxia", cosyvoice_id: "longxiaoxia", status: "success" },
    { voice_name: "诚睿", language: "中英", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/xrqksx/%E9%BE%99%E5%B0%8F%E8%AF%9A.mp3", voice_id: "longxiaocheng", cosyvoice_id: "longxiaocheng", status: "success" },
    { voice_name: "素心", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/vusvze/%E9%BE%99%E5%B0%8F%E7%99%BD.mp3", voice_id: "longxiaobai", cosyvoice_id: "longxiaobai", status: "success" },
    { voice_name: "铁山", language: "东北话", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/pfsfir/%E9%BE%99%E8%80%81%E9%93%81.mp3", voice_id: "longlaotie", cosyvoice_id: "longlaotie", status: "success" },
    { voice_name: "墨轩", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/azcerd/%E9%BE%99%E4%B9%A6.mp3", voice_id: "longshu", cosyvoice_id: "longshu", status: "success" },
    { voice_name: "峻峰", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/lcykpl/%E9%BE%99%E7%A1%95.mp3", voice_id: "longshuo", cosyvoice_id: "longshuo", status: "success" },
    { voice_name: "婉清", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/ozkbmb/%E9%BE%99%E5%A9%A7.mp3", voice_id: "longjing", cosyvoice_id: "longjing", status: "success" },
    { voice_name: "灵犀", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/zjnqis/%E9%BE%99%E5%A6%99.mp3", voice_id: "longmiao", cosyvoice_id: "longmiao", status: "success" },
    { voice_name: "欣怡", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/nrkjqf/%E9%BE%99%E6%82%A6.mp3", voice_id: "longyue", cosyvoice_id: "longyue", status: "success" },
    { voice_name: "雅宁", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/xuboos/%E9%BE%99%E5%AA%9B.mp3", voice_id: "longyuan", cosyvoice_id: "longyuan", status: "success" },
    { voice_name: "凌霄", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/bhkjjx/%E9%BE%99%E9%A3%9E.mp3", voice_id: "longfei", cosyvoice_id: "longfei", status: "success" },
    { voice_name: "杰睿", language: "中英", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/dctiyg/%E9%BE%99%E6%9D%B0%E5%8A%9B%E8%B1%86.mp3", voice_id: "longjielidou", cosyvoice_id: "longjielidou", status: "success" },
    { voice_name: "绯云", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/qyqmvo/%E9%BE%99%E5%BD%A4.mp3", voice_id: "longtong", cosyvoice_id: "longtong", status: "success" },
    { voice_name: "瑞霖", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/jybshd/%E9%BE%99%E7%A5%A5.mp3", voice_id: "longxiang", cosyvoice_id: "longxiang", status: "success" },
    { voice_name: "星澜", language: "中英", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/haffms/Stella.mp3", voice_id: "loongstella", cosyvoice_id: "loongstella", status: "success" },
    { voice_name: "贝翎", language: "中", clone_voice_url: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240624/tguine/Bella.mp3", voice_id: "loongbella", cosyvoice_id: "loongbella", status: "success" }
];
let url_prefix = "";
let rolesList = [];
let voices_list = [];
let selectedRoleID = null;
let selectedRole = null;
let intervalId = null;

function checkMembershipValid() {
    return true;
}

function getStatusText(status) {
    switch (status) {
        case 'cloning': return '克隆中';
        case 'failed': return '失败';
        case 'success': return '成功';
        default: return status;
    }
}

// 检查语音状态
function check_voice_status() {
    voices_list = JSON.parse(localStorage.getItem('voices_list')) || [];
    console.log('pageshow 加载 voices_list:', voices_list);

    // 清除旧的计时器
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // 找到第一个 pending 的语音进行轮询（简化逻辑）
    const pendingVoice = voices_list.find(voice => voice.status === 'pending');
    if (!pendingVoice) return;

    const checkVoiceStatus = async () => {
        try {
            const response = await fetch(url_prefix + '/voice/check_voice_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unionid: pendingVoice.unionid,
                    voice_id: pendingVoice.voice_id
                })
            });
            const result_voice = await response.json();

            // 更新状态
            Object.assign(pendingVoice, result_voice);
            localStorage.setItem('voices_list', JSON.stringify(voices_list));
            console.log(`语音 ${pendingVoice.voice_id} 状态已更新为 ${result_voice.status}`);

            renderVoiceList('my-voices', voices_list);

            // 如果状态不再是 pending，停止轮询
            if (pendingVoice.status !== 'pending') {
                clearInterval(intervalId);
                intervalId = null;
            }
        } catch (error) {
            console.error('请求失败:', error);
            // 可选择继续轮询或停止
        }
    };

    intervalId = setInterval(checkVoiceStatus, 15000); // 每15秒检查一次
}

async function deleteVoice(deleted_voice) {
    const response = await fetch(url_prefix + '/voice/delete_voice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            unionid: deleted_voice.unionid,
            voice_id: deleted_voice.voice_id
        })
    });
    const result = await response.json();
    console.log(result);
    if (result.status === "success") {
        XSAlert('删除成功');
        const index = voices_list.findIndex(v => v.voice_id === deleted_voice.voice_id);
        if (index > -1) {
            voices_list.splice(index, 1);
            localStorage.setItem('voices_list', JSON.stringify(voices_list));
            renderVoiceList('my-voices', voices_list);
        }
    } else {
        XSAlert('删除失败');
    }
}

// 渲染音色列表
function renderVoiceList(containerId, voices) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    voices.forEach(voice => {
        const isSelected = voice.cosyvoice_id === selectedRole.cosyvoice_id;
        // 注意：不再用 isDisabled 控制整个元素的 disabled 状态
        // 而是仅在需要时控制“选中”行为

        const option = document.createElement('div');
        option.className = `voice-option ${isSelected ? 'selected' : ''}`;
        // 不再加 'disabled' 类到整个 option

        // 删除按钮（仅我的声音）
        let deleteBtn = '';
        if (containerId === "my-voices") {
            deleteBtn = `<button class="delete-btn" data-voice-id="${voice.cosyvoice_id}">
                <i class="material-icons">delete</i>
            </button>`;
        }

        // 预览/状态按钮
        let actionBtn = '';
        if (voice.status === 'pending') {
            actionBtn = `<button class="preview-btn" disabled>
                <i class="material-icons">hourglass_empty</i>
                克隆中
            </button>`;
        } else if (voice.status === 'failed') {
            actionBtn = `<button class="preview-btn" disabled>
                <i class="material-icons">error</i>
                失败
            </button>`;
        } else if (voice.status === 'success' && voice.clone_voice_url) {
            actionBtn = `<button class="preview-btn" data-voice-id="${voice.cosyvoice_id}">
                <i class="material-icons">play_arrow</i>
                试听
            </button>`;
        }

        option.innerHTML = `
            <div class="voice-option-info">
                <div class="voice-option-name">${voice.voice_name}</div>
                <div class="voice-option-id">ID: ${voice.cosyvoice_id}</div>
            </div>
            <div class="voice-option-action">
                ${deleteBtn}
                ${actionBtn}
            </div>
        `;

        // 点击选中逻辑（仅当状态为 success 时才允许选中）
        if (containerId !== "my-voices" || voice.status === "success") {
            option.className = `voice-option ${isSelected ? 'selected' : ''} ''`;
            option.addEventListener('click', () => {
                option.dataset.voiceId = voice.cosyvoice_id;
            });
        }

        // 删除按钮事件（仅我的声音）
        if (containerId === 'my-voices') {
            const deleteBtnEl = option.querySelector('.delete-btn');
            if (deleteBtnEl) {
                deleteBtnEl.addEventListener('click', async (e) => {
                    e.stopPropagation(); // 阻止冒泡到 option 的 click
                    const confirmed = await XSConfirm('确定要删除此音色吗？删除后不能找回');
                    if (confirmed) {
                        try {
                            await deleteVoice(voice);
                        } catch (error) {
                            console.error('删除失败:', error);
                            XSAlert('删除失败: ' + error.message);
                        }
                    }
                });
            }
        }

        container.appendChild(option);
    });
}

function setupVoice(cosyvoice_id)
{
    voices_list = JSON.parse(localStorage.getItem('voices_list')) || [];
    const currentVoice = voices_list.find(voice => voice.cosyvoice_id === cosyvoice_id) || officialVoices.find(v => v.cosyvoice_id === cosyvoice_id);
    const selectedVoiceName = document.getElementById('selected-voice-name');
    const selectedVoiceId = document.getElementById('selected-voice-id');

    if (currentVoice) {
        selectedVoiceName.textContent = currentVoice.voice_name;
        selectedVoiceId.textContent = `ID: ${currentVoice.cosyvoice_id}`;
    }

    renderVoiceList('my-voices', voices_list);
    renderVoiceList('official-voices', officialVoices);

    const voiceSelectTrigger = document.getElementById('voice-select-trigger');
    const dropdownArrow = voiceSelectTrigger.querySelector('.dropdown-arrow');
    const voiceOptions = document.getElementById('voice-options');

    voiceSelectTrigger.addEventListener('click', function () {
        voiceOptions.classList.toggle('open');
        dropdownArrow.classList.toggle('open');
        voiceSelectTrigger.classList.toggle('open');
    });

    voiceOptions.addEventListener('click', function (e) {
        const option = e.target.closest('.voice-option');
        if (!option) return;

        // 试听
        if (e.target.closest('.preview-btn')) {
            e.stopPropagation();
            const button = e.target.closest('.preview-btn');
            const voiceId = button.dataset.voiceId;
            const voice = voices_list.find(v => v.cosyvoice_id === voiceId)
                || officialVoices.find(v => v.cosyvoice_id === voiceId);

            if (!voice || !voice.clone_voice_url) {
                alert('未找到可试听的语音样本');
                return;
            }

            const originalHtml = button.innerHTML;
            button.innerHTML = '<i class="material-icons">volume_up</i> 试听中...';
            button.disabled = true;

            const audio = new Audio(voice.clone_voice_url);
            audio.addEventListener('canplaythrough', () => {
                audio.play().catch(() => {
                    button.innerHTML = originalHtml;
                    button.disabled = false;
                    alert('语音播放失败，请检查网络连接');
                });
            });
            audio.addEventListener('ended', () => {
                button.innerHTML = '<i class="material-icons">play_arrow</i> 试听';
                button.disabled = false;
            });
            audio.addEventListener('error', () => {
                button.innerHTML = originalHtml;
                button.disabled = false;
                alert('语音加载失败，请检查音频文件地址');
            });
            return;
        }

        const voiceId = option.dataset.voiceId;
        const voice = voices_list.find(v => v.cosyvoice_id === voiceId)
            || officialVoices.find(v => v.cosyvoice_id === voiceId);

        if (!voice || voice.status !== 'success') return;

        document.querySelectorAll('.voice-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        selectedVoiceName.textContent = voice.voice_name;
        selectedVoiceId.textContent = `ID: ${voice.cosyvoice_id}`;
        selectedRole.cosyvoice_id = voice.cosyvoice_id;

        voiceOptions.classList.remove('open');
        dropdownArrow.classList.remove('open');
        voiceSelectTrigger.classList.remove('open');
    });

    document.addEventListener('click', function (e) {
        if (!voiceSelectTrigger.contains(e.target) && !voiceOptions.contains(e.target)) {
            voiceOptions.classList.remove('open');
            dropdownArrow.classList.remove('open');
            voiceSelectTrigger.classList.remove('open');
        }
    });

    const voiceModal = new VoiceModal();

    document.getElementById('add-voice-btn').addEventListener('click', () => {
        if (!checkMembershipValid()) {
            XSAlert('您未开通权限');
            return;
        }
        voiceModal.show();
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];

    selectedRoleID = localStorage.getItem('selectedRoleID');
    if (!selectedRoleID) throw new Error('未找到角色ID');

    const unionid = localStorage.getItem('unionid');
    if (!unionid) throw new Error('用户未登录，请重新登录');

    selectedRole = rolesList.find(role => role.avatar_id === selectedRoleID);
    if (!selectedRole) throw new Error('角色信息不存在，请重新选择');
    console.log("selectedRole: ", selectedRole);

    const { avatar_name, avatar_url, system_prompt, avatar_id, cosyvoice_id, chat_count, memory_prompt_url, memory_version, created_time, updated_time } = selectedRole;

    document.getElementById('name-input').value = avatar_name || '';
    const textarea = document.getElementById('character-desc');
    textarea.value = system_prompt || '';

    const avatarDisplay = document.getElementById('avatar-display');
    if (avatar_url) {
        avatarDisplay.innerHTML = `<img src="${avatar_url}" alt="${avatar_name}">`;
    }

    setupVoice(cosyvoice_id);

    const counter = document.getElementById('word-counter');
    textarea.addEventListener('input', function () {
        const currentLength = this.value.length;
        counter.textContent = `${currentLength}/500`;
        counter.classList.toggle('warning', currentLength > 500);
    });
    textarea.dispatchEvent(new Event('input'));

    document.getElementById('update-btn').addEventListener('click', async function () {
        const newName = document.getElementById('name-input').value.trim();
        const newSystemPrompt = document.getElementById('character-desc').value;

        if (!newName) {
            XSAlert('角色名称不能为空');
            return;
        }

        selectedRole.avatar_name = newName;
        selectedRole.system_prompt = newSystemPrompt;

        const updatedRolesList = rolesList.map(role =>
            role.avatar_id === selectedRoleID ? selectedRole : role
        );
        localStorage.setItem('roles_list', JSON.stringify(updatedRolesList));

        try {
            const response = await fetch(url_prefix + '/auth/update_role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar_id: selectedRoleID,
                    unionid: unionid,
                    avatar_name: newName,
                    cosyvoice_id: selectedRole.cosyvoice_id || '',
                    system_prompt: newSystemPrompt
                })
            });

            const result = await response.json();
            XSAlert(result.code === 0 ? '角色信息已更新' : '角色信息更新失败，请稍后重试');
        } catch (error) {
            console.error('请求失败:', error);
            XSAlert('网络错误，请检查网络连接');
        }
    });

    await window.memoryDataDB.init();
    let memoryData = await window.memoryDataDB.getMemoryDataByAvatarID(selectedRoleID);
    memoryData = memoryData.length > 0 ? memoryData[0] : null;

    document.getElementById('intimacy-level').textContent = `Lv.${selectedRole.chat_count}`;
    document.getElementById('chat-count').textContent = selectedRole.chat_count;

    const createdTime = new Date(created_time);
    const now = new Date();
    const createdDiffTime = Math.abs(now - createdTime);
    const createdDiffDays = Math.floor(createdDiffTime / (1000 * 60 * 60 * 24));
    document.getElementById('created-days').textContent = `${createdDiffDays}天`;

    const updatedTime = new Date(updated_time);
    const lastActiveDiffTime = Math.abs(now - updatedTime);
    const lastActiveDiffDays = Math.floor(lastActiveDiffTime / (1000 * 60 * 60 * 24));
    document.getElementById('last-active').textContent = `${lastActiveDiffDays}天前`;

    const memoryList = document.getElementById('memory-list');
    const memoryEmpty = document.getElementById('memory-empty');

    function renderMemories() {
        if (memoryData && memoryData.memories.length > 0) {
            memoryEmpty.style.display = 'none';
            memoryList.innerHTML = '';
            const memoriesToRender = memoryData.memories.slice(0, 20);
            memoriesToRender.forEach(memory => {
                const memoryItem = document.createElement('div');
                memoryItem.className = 'memory-item';
                memoryItem.innerHTML = `<div class="memory-text">${memory.text}</div>`;
                memoryList.appendChild(memoryItem);
            });
        } else {
            memoryEmpty.style.display = 'block';
        }
    }

    renderMemories();
});

// 监听 localStorage 的变化
window.addEventListener('storage', (event) => {
    if (event.key === 'voices_list') {
        console.log('voices_list 发生变化，重新渲染我的语音');
        voices_list = JSON.parse(localStorage.getItem('voices_list')) || [];
        renderVoiceList('my-voices', voices_list);
    }
    else if (event.key === 'roles_list') {
        rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
        console.log('角色列表已更新:', rolesList);
    }
});

// 页面卸载时清除计时器
window.addEventListener('pagehide', () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});

window.addEventListener('pageshow', () => {
    voices_list = JSON.parse(localStorage.getItem('voices_list')) || [];
    selectedRoleID = localStorage.getItem('selectedRoleID');
    if (!selectedRoleID) throw new Error('未找到角色ID');

    rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
    selectedRole = rolesList.find(role => role.avatar_id === selectedRoleID);
    if (!selectedRole) throw new Error('角色信息不存在，请重新选择');
    console.log("selectedRole: ", selectedRole);
    renderVoiceList('my-voices', voices_list);
    renderVoiceList('official-voices', officialVoices);
    check_voice_status();
});