let unionid = "MatesX01";
let rolesList = [];
let intervalId = null; // 全局变量存储计时器 ID

function createRoleCard(role) {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    // 添加失败状态类名
    if (role.status === 'failed') {
        card.classList.add('failed-card');
    }

    // 图片容器
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    // 图片元素
    const img = document.createElement('img');
    img.className = 'character-image';
    img.src = role.avatar_url;

    // 将图片添加到容器
    imgContainer.appendChild(img);

    // 处理失败状态
    if (role.status === 'failed') {
        // 创建错误覆盖层
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';

        errorOverlay.innerHTML = `
            <span class="material-icons error-icon">error_outline</span>
            <div class="error-message">${role.errorMessage || '上传失败'}</div>
        `;
        imgContainer.appendChild(errorOverlay);
    }

    // 如果状态为 pending，添加加载动画并禁用点击事件
    if (role.status === 'pending') {
        // 添加加载动画
        const loader = document.createElement('div');
        loader.className = 'loader'; // 使用 CSS 实现加载动画
        imgContainer.appendChild(loader);

        // 禁用点击事件
        card.style.pointerEvents = 'none';
    }

    // 角色名称
    const nameDiv = document.createElement('div');
    nameDiv.className = 'character-name';
    nameDiv.textContent = role.avatar_name;

    // 将元素添加到卡片
    card.appendChild(imgContainer);
    card.appendChild(nameDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = '删除角色';

    // 添加 Material Icon
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-icons';
    deleteIcon.textContent = 'delete';
    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isConfirmed = await XSConfirm(`确定要删除 ${role.avatar_name} 吗？`);
        if (isConfirmed) {
            try {
                const response = await fetch('/auth/remove_role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        unionid: role.unionid,
                        avatar_id: role.avatar_id
                    })
                });

                if (!response.ok) throw new Error('请求失败');

                card.remove();
                rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
                rolesList = rolesList.filter(item => item.avatar_id !== role.avatar_id);
                localStorage.setItem('roles_list', JSON.stringify(rolesList));
                console.log(`已删除角色：${role.avatar_name}`);
                XSAlert('角色删除成功');
            } catch (error) {
                console.error('删除角色失败:', error);
                XSAlert('删除角色失败，请重试');
            }
        }
    });
    card.appendChild(deleteBtn);

    if (role.status !== 'pending') {
        card.addEventListener('click', async () => {
            localStorage.setItem('selectedRoleID', role.avatar_id);

            const response = await fetch('/auth/check_role_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unionid: role.unionid,
                    avatar_id: role.avatar_id  // 保持字段名不变
                })
            });
            const result_role = await response.json();
            rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
            const existingIndex = rolesList.findIndex(r => r.avatar_id === role.avatar_id);
            rolesList[existingIndex] = { ...rolesList[existingIndex], ...result_role };
            localStorage.setItem('roles_list', JSON.stringify(rolesList));

            window.location.href = 'character.html?avatar_mode=private';
        });
    }

    return card;
}

function renderRoleCards() {
    const gridGallery = document.querySelector('.grid-gallery');
    gridGallery.innerHTML = ''; // 清空现有内容

    // 生成角色卡片
    rolesList.forEach(role => {
        gridGallery.appendChild(createRoleCard(role));
    });

    // 添加"新增形象"卡片
    const addCard = document.createElement('div');
    addCard.className = 'gallery-item add-card';
    addCard.innerHTML = `
        <span class="material-icons add-icon">add_circle</span>
        <div class="character-name">新增形象</div>
    `;
    addCard.addEventListener('click', () => {
        window.location.href = 'create-role.html?v=1.20'; // 示例跳转
    });
    gridGallery.appendChild(addCard);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化底部导航栏交互 (同步执行，免受网络请求延迟阻塞)
    initNavigation();

    // 2. 初始化退出登录逻辑
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 3. 执行异步登录并获取最新数据
    (async () => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ unionid })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '验证失败');

            localStorage.setItem('unionid', result.userInfo.unionid);
            localStorage.setItem('nickname', result.userInfo.nickname || 'explorer');
            localStorage.setItem('membership_level', result.userInfo.membership_level ?? 0);
            localStorage.setItem('membership_expiry_time', result.userInfo.membership_expiry_time || '2025-03-23 00:00:00');
            localStorage.setItem('avatar_balance', result.userInfo.avatar_balance ?? 0);
            localStorage.setItem('voice_balance', result.userInfo.voice_balance ?? 0);
            localStorage.setItem('voices_list', JSON.stringify(result.userInfo.voices_list));
            localStorage.setItem('roles_list', JSON.stringify(result.userInfo.roles_list));
            localStorage.setItem('bg_list', JSON.stringify(result.userInfo.bg_list));
            localStorage.setItem('tencentTTS', result.userInfo.tencentTTS);
            localStorage.setItem('token_balance', result.userInfo.token_balance);
            rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
            
            // 更新顶部余额显示
            const balanceEl = document.getElementById('user-token-balance');
            if (balanceEl) {
                balanceEl.textContent = Number(result.userInfo.token_balance).toLocaleString();
            }

            // 重新渲染角色卡片
            renderRoleCards();

            // 如果当前在"我的"页面，即时更新额度
            const myPage = document.getElementById('my-page');
            if (myPage && myPage.classList.contains('page-active')) {
                updateMyPage();
            }
        } catch (error) {
            console.error('登录错误:', error.message);
            // 降级渲染本地缓存角色
            rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
            renderRoleCards();
        }
    })();

    // 4. 卡片及列表项动效注册
    document.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            if(card.querySelector('.character-image')) {
                card.querySelector('.character-image').style.transform = 'scale(1.05)';
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            if(card.querySelector('.character-image')) {
                card.querySelector('.character-image').style.transform = 'none';
            }
        });
    });

    document.querySelectorAll('.setting-item').forEach(item => {
        item.addEventListener('click', () => {
            item.style.background = '#F8F9FA';
            setTimeout(() => item.style.background = '', 200);
        });
    });
});

function updateMyPage() {
    const nickname = localStorage.getItem('nickname') || 'explorer';
    const membershipLevel = parseInt(localStorage.getItem('membership_level') || '0');
    const membershipExpiry = localStorage.getItem('membership_expiry_time') || '';
    const tokenBalance = parseInt(localStorage.getItem('token_balance') || '0');
    const avatarBalance = parseFloat(localStorage.getItem('avatar_balance') || '0');
    const voiceBalance = parseFloat(localStorage.getItem('voice_balance') || '0');
    
    const nickEl = document.getElementById('my-nickname');
    const vipEl = document.getElementById('my-vip');
    const tokensEl = document.getElementById('quota-tokens');
    const avatarsEl = document.getElementById('quota-avatars');
    const voicesEl = document.getElementById('quota-voices');
    
    if (nickEl) nickEl.textContent = nickname;
    if (vipEl) {
        if (membershipLevel > 0) {
            vipEl.textContent = `VIP 会员 (有效期至: ${membershipExpiry.split(' ')[0]})`;
            vipEl.style.color = '#FF385C';
        } else {
            vipEl.textContent = '普通体验版';
            vipEl.style.color = '#666';
        }
    }
    if (tokensEl) tokensEl.textContent = tokenBalance.toLocaleString();
    if (avatarsEl) avatarsEl.textContent = avatarBalance.toLocaleString();
    if (voicesEl) voicesEl.textContent = voiceBalance.toLocaleString();
}

function renderDiscoveryCards() {
    const discoveryContainer = document.getElementById('discoveryContainer');
    if (!discoveryContainer) return;
    discoveryContainer.innerHTML = '';
    
    const sampleItems = [
        {
            title: "艾拉 (Aila) - 二次元猫娘伴侣",
            tag: "二次元",
            description: "活泼粘人的猫娘学妹，喜欢撒娇，渴望陪伴。使用 CosyVoice 精细配音，拥有灵动可爱的面部反馈与超低延迟对话。",
            image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
            author: "@MatesX_otaku",
            likes: 1208
        },
        {
            title: "星原 (Xinyuan) - 朋克风科幻助手",
            tag: "科幻",
            description: "来自 2077 年的AI仿生助手，精通物理与赛博朋克史。具有超强的情感记忆舱，适合深夜探索时空的深度对谈。",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
            author: "官方推荐",
            likes: 3421
        },
        {
            title: "楚秋 (Chuqiu) - 古风古韵文豪",
            tag: "文学",
            description: "一袭长衫，执扇而立。精通古典诗词与中国历史，能与你对诗共饮，为你声情并茂地朗读诗词文案。",
            image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=300",
            avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100",
            author: "@墨染",
            likes: 954
        }
    ];

    sampleItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'discovery_card';
        card.innerHTML = `
            <div class="discovery_media-container">
                <div class="discovery_tag">${item.tag}</div>
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="discovery_content-info">
                <div class="discovery_description" style="font-weight: 700; margin-bottom: 6px; color: #1a1a1a;">${item.title}</div>
                <div class="discovery_description">${item.description}</div>
                <div class="discovery_user-info">
                    <img class="discovery_avatar" src="${item.avatar}" alt="${item.author}">
                    <span class="discovery_user-name">${item.author}</span>
                    <div class="discovery_action-bar">
                        <button class="discovery_like-btn">
                            <span class="material-icons" style="font-size: 18px; margin-right: 4px;">favorite_border</span>
                            <span class="like-count">${item.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const likeBtn = card.querySelector('.discovery_like-btn');
        const countSpan = card.querySelector('.like-count');
        const iconSpan = card.querySelector('.material-icons');
        let liked = false;
        
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            liked = !liked;
            if (liked) {
                likeBtn.classList.add('discovery_liked');
                iconSpan.textContent = 'favorite';
                iconSpan.style.color = '#ff2442';
                countSpan.textContent = item.likes + 1;
            } else {
                likeBtn.classList.remove('discovery_liked');
                iconSpan.textContent = 'favorite_border';
                iconSpan.style.color = '#999';
                countSpan.textContent = item.likes;
            }
        });

        card.addEventListener('click', () => {
            window.location.href = 'create-role.html';
        });

        discoveryContainer.appendChild(card);
    });
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-bar .nav-item');
    const pages = document.querySelectorAll('.page-container');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            pages.forEach(p => p.classList.remove('page-active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.add('page-active');
            }

            if (targetId === 'discovery-page') {
                renderDiscoveryCards();
            } else if (targetId === 'my-page') {
                updateMyPage();
            }
        });
    });
}

// 监听 localStorage 的变化
window.addEventListener('storage', (event) => {
    if (event.key === 'roles_list') {
        // 如果 roles_list 发生变化，立即调用 renderRoleCards
        console.log('roles_list 发生变化，重新渲染角色卡片');
        rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
        renderRoleCards();
    }
});


window.addEventListener('pageshow', () => {
    let rolesList_ = JSON.parse(localStorage.getItem('roles_list')) || [];

    // 清除旧的计时器
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // 遍历角色列表
    rolesList_.forEach(async (role) => {
        if (role.status === 'pending') {
            // 定义一个函数，用于检查角色状态
            const checkRoleStatus = async () => {
                try {
                    // 发送请求检查角色状态
                    const response = await fetch('/auth/check_role_status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            unionid: role.unionid,
                            avatar_id: role.avatar_id  // 保持字段名不变
                        })
                    });

                    // 解析响应
                    const result_role = await response.json();

                    // 如果角色状态为 "success"，停止计时器并更新角色状态
                    if (result_role.status === 'success' || result_role.status === 'failed') {
                        clearInterval(intervalId); // 停止计时器
                        intervalId = null; // 重置计时器 ID
                        // 更新role为result_role
                        Object.assign(role, result_role);
                        localStorage.setItem('roles_list', JSON.stringify(rolesList_)); // 更新localStorage
                        console.log(`角色 ${role.avatar_id} 状态已更新为 ${role.status}`);
                        rolesList = rolesList_;
                        renderRoleCards();
                    }
                } catch (error) {
                    console.error('请求失败:', error);
                }
            };

            // 开启一个计时器，每1分钟向服务器发送请求
            intervalId = setInterval(checkRoleStatus, 30000); // 每半分钟执行一次
        }
    });
});