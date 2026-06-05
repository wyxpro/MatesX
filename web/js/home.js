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

document.addEventListener('DOMContentLoaded', async () => {
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
    } catch (error) {
        console.error('登录错误:', error.message);
    }

    // 初始化角色卡片
    renderRoleCards();

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