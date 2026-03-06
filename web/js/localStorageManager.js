let urlPrefix = "";
let serverUrl = urlPrefix + "/chat/chat_stream"
let authUrl = urlPrefix + "/generate_temp_token"

function getRoleList(avatar_mode) {
    if (avatar_mode === "public") {
        return JSON.parse(localStorage.getItem('public_roles_list')) || [];
    }
    else {
        return JSON.parse(localStorage.getItem('roles_list')) || [];
    }
}

// 存储临时token及其获取时间
let tempTokenCache = {
    model: null,
    token: null,
    timestamp: null
};

async function getTempToken(model_name, voice_id) {
    const unionid = localStorage.getItem('unionid');
    if (!unionid)
    {
        XSAlert('用户未登录');
        return;
    }
    // 检查缓存中是否有有效的token（40秒内）
    const now = Date.now();
    if (tempTokenCache.token && tempTokenCache.timestamp &&
        (now - tempTokenCache.timestamp) < 40000 && tempTokenCache.model == model_name) {
        return tempTokenCache.token;
    }
    try {
        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ unionid, model_name, voice_id }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 更新缓存
        tempTokenCache = {
            model: model_name,
            token: data.token,
            timestamp: now
        };

        return data.token;
    } catch (error) {
        console.error('获取临时token失败:', error);
        XSAlert('无法获取语音服务凭证，请稍后重试');
        throw error;
    }
}

function checkUnionid() {
    const unionid = localStorage.getItem('unionid');
    if (!unionid)
    {
        alert('用户未登录');
        return false;
    }
    return true;
}

function getRoleByID(avatar_mode, selectedRoleID) {
    let rolesList = [];
    if (avatar_mode === "public") {
        rolesList = JSON.parse(localStorage.getItem('public_roles_list')) || [];
    }
    else {
        rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
    }

    const selectedRole = rolesList.find(role => role.avatar_id === selectedRoleID);
    if (!selectedRole) {
        XSAlert('角色列表中未找到角色');
        return;
    }
    return selectedRole;
}

function getVoiceIDByID(voice_id) {
    const tencentTTS = parseInt(localStorage.getItem('tencentTTS')) || 0;
    if (tencentTTS === 0 && (voice_id.slice(0, 4) === "5010" || voice_id.slice(0, 4) === "6010"))
    {
        XSAlert("角色使用了腾讯云语音，但您的服务器未配置腾讯云服务，暂时改为阿里云临时音色");
        voice_id = "longwan";
    }
    else if (tencentTTS > 0 && (voice_id.slice(0, 4) === "long" || voice_id.slice(0, 4) === "loon")) {
        XSAlert("角色使用了阿里云语音，但您的服务器设置了优先使用腾讯云服务，暂时改为腾讯云临时音色");
        voice_id = "501004";
    }

    let tts_model = "tencent";
    if (voice_id.slice(0, 4) === "5010" || voice_id.slice(0, 4) === "6010") {
        tts_model = "tencent";
    } else {
        tts_model = "ali";
    }
    return [tts_model, voice_id];
}

async function sendChatRequest(requestBody, signal) {
    const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: signal
    });

    if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);
    await handleResponseStream(response.body, signal);
}
