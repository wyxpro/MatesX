
# 🌟 MatesX — AI 数字分身对话平台

> 基于大语言模型与实时语音合成的 AI 虚拟角色互动平台，支持 Web、桌面（Electron）、移动（Android）及微信小程序多端部署。

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop%20%7C%20Android%20%7C%20MiniApp-brightgreen)]()

</div>

---

## 📋 项目简介

**MatesX** 是一个功能完整的 **AI虚拟角色对话系统**，支持用户创建个性化数字人形象、进行实时语音/文字对话，并具备智能记忆功能。项目采用前后端分离架构，支持多平台部署，包括 Web 端、Android 移动端、微信小程序和 Electron 桌面端。

### 核心特性

- **数字人形象创建**：支持图片/视频上传生成数字人形象
- **实时语音对话**：基于 WebSocket 的低延迟实时语音交互
- **语音克隆**：支持用户自定义音色，8-20秒音频即可克隆
- **智能记忆系统**：基于向量嵌入的长时记忆管理
- **流式 LLM 响应**：集成阿里云通义千问大模型
- **多平台支持**：Web、Android、微信小程序、Electron 桌面端

---

## 🛠️ 技术栈

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.8+ | 后端开发语言 |
| FastAPI | Latest | 高性能异步 Web 框架 |
| Uvicorn | Latest | ASGI 服务器 |
| SQLite | 3.x | 轻量级数据库 |
| OpenAI SDK | Latest | LLM API 调用（兼容阿里云） |
| DashScope | - | 阿里云 AI 服务 SDK |
| httpx | Latest | 异步 HTTP 客户端 |
| NumPy | Latest | 向量计算 |
| cachetools | Latest | 缓存管理 |

### 前端技术栈

| 技术 | 用途 |
|------|------|
| HTML5/CSS3/JavaScript | Web 前端开发 |
| Web Audio API | 音频录制与播放 |
| AudioWorklet | 低延迟音频处理 |
| WebSocket | 实时通信 |
| IndexedDB | 本地数据存储 |

### AI 服务

| 服务 | 用途 |
|------|------|
| 阿里云通义千问 (qwen-plus) | 大语言模型对话 |
| 阿里云 CosyVoice | 语音合成 (TTS) |
| 阿里云 Paraformer | 实时语音识别 (ASR) |
| 阿里云 text-embedding-v4 | 文本向量嵌入 |
| 腾讯云 TTS (可选) | 备用语音合成服务 |
| matesx.cn API | 数字人形象生成服务 |

### 平台技术

| 平台 | 技术 |
|------|------|
| Android | Kotlin + Android SDK 35 |
| 微信小程序 | 微信小程序原生框架 |
| Electron | Electron 38.x + Electron Forge |

---

## 🏗️ 项目架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                    │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│  Web 端     │ Android App │ 微信小程序  │   Electron 桌面端        │
│  (HTML/JS)  │  (Kotlin)   │  (WXML/JS)  │   (Electron)            │
└──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────────┘
       │             │             │                  │
       └─────────────┴─────────────┴──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端服务层 (Backend Layer)                   │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Application (main.py)                                  │
│  ├── /auth  - 用户认证与角色管理                                  │
│  ├── /chat  - 对话流式传输                                        │
│  └── /voice - 语音克隆管理                                        │
├─────────────────────────────────────────────────────────────────┤
│  业务模块                                                        │
│  ├── SessionManager  - 会话管理与缓存                            │
│  ├── MemoryManager   - 智能记忆系统                              │
│  ├── LLMStreaming    - LLM 流式响应处理                          │
│  └── SQLiteManager   - 数据持久化                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI 服务层 (AI Service Layer)                 │
├─────────────────────────────────────────────────────────────────┤
│  阿里云 DashScope API                                           │
│  ├── 通义千问 (qwen-plus)    - 对话生成                          │
│  ├── CosyVoice              - 语音合成                           │
│  ├── Paraformer Realtime    - 实时语音识别                       │
│  └── text-embedding-v4      - 文本向量化                         │
├─────────────────────────────────────────────────────────────────┤
│  matesx.cn API - 数字人形象生成                                  │
│  腾讯云 TTS (可选) - 备用语音合成                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流架构

```
用户语音输入
     │
     ▼
┌─────────────┐    WebSocket     ┌─────────────────┐
│ VAD 检测    │ ──────────────► │ Paraformer ASR  │
│ (WebAudio)  │                  │ (实时语音识别)   │
└─────────────┘                  └────────┬────────┘
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │  文本结果       │
                                  └────────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
           │ Memory Search  │   │  LLM Stream    │   │  Chat History  │
           │ (向量检索记忆)  │   │ (通义千问)     │   │  (会话缓存)    │
           └────────┬───────┘   └────────┬───────┘   └────────────────┘
                    │                    │
                    └──────────┬─────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │  SSE 流式响应   │
                       └────────┬────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
           ┌────────────────┐      ┌────────────────┐
           │  CosyVoice TTS │      │  文字显示      │
           │  (语音合成)     │      │  (聊天界面)    │
           └────────┬───────┘      └────────────────┘
                    │
                    ▼
           ┌────────────────┐
           │  AudioWorklet  │
           │  (音频播放)     │
           └────────────────┘
```

---

## 📁 目录结构

```
MatesX/
├── main.py                    # FastAPI 主入口文件
├── requirements.txt           # Python 依赖清单
│
├── routers/                   # API 路由模块
│   ├── __init__.py           # 路由导出
│   ├── auth.py               # 用户认证与角色管理 API
│   ├── chat.py               # 对话流式传输 API
│   └── voice.py              # 语音克隆管理 API
│
├── utils/                     # 工具模块
│   ├── dashscope.py          # 阿里云 DashScope 配置与工具函数
│   ├── llm_streaming.py      # LLM 流式响应处理
│   ├── memory.py             # 智能记忆管理器
│   ├── session_manager.py    # 用户会话管理
│   └── sqlite_manager.py     # SQLite 数据库操作
│
├── web/                       # Web 前端
│   ├── home.html             # 主页 - 角色展示
│   ├── character.html        # 角色对话页面
│   ├── character-setting.html # 角色设置页面
│   ├── create-role.html      # 创建新角色页面
│   ├── dialog-realtime.html  # 实时对话界面
│   ├── dialog-voice.html     # 语音对话界面
│   ├── modal.html            # 模态框组件
│   │
│   ├── css/                  # 样式文件
│   │   ├── home.css          # 主页样式
│   │   ├── gallery.css       # 画廊样式
│   │   ├── modal.css         # 模态框样式
│   │   ├── my.css            # 个人中心样式
│   │   └── xs-styles.css     # 公共样式
│   │
│   └── js/                   # JavaScript 模块
│       ├── home.js           # 主页逻辑
│       ├── dialogRealtime.js # 实时对话核心逻辑
│       ├── dialogVoice.js    # 语音对话逻辑
│       ├── createRole.js     # 角色创建逻辑
│       ├── characterSetting.js # 角色设置逻辑
│       ├── cosyvoiceApi.js   # CosyVoice TTS 封装
│       ├── tencentTtsApi.js  # 腾讯 TTS 封装
│       ├── paraformerRealtimeApi.js # ASR 实时识别封装
│       ├── audioPlayer.js    # PCM 音频播放器
│       ├── audioRecorder.js  # PCM 音频录制器
│       ├── voiceClone.js     # 语音克隆逻辑
│       ├── embedding.js      # 文本向量嵌入
│       ├── database.js       # IndexedDB 操作
│       ├── localStorageManager.js # 本地存储管理
│       ├── xsComponents.js   # UI 组件库
│       ├── DHLiveMini2.js    # 数字人渲染引擎
│       ├── MiniLive.js       # 轻量级直播引擎
│       └── MiniMateLoader_public.js # 资源加载器
│
├── platform/                  # 多平台支持
│   ├── android/              # Android 应用
│   │   ├── app/
│   │   │   ├── src/main/
│   │   │   │   ├── java/com/github/kleinlee/matesx/
│   │   │   │   │   └── MainActivity.kt
│   │   │   │   └── AndroidManifest.xml
│   │   │   └── build.gradle.kts
│   │   └── gradle/
│   │
│   ├── electron/             # Electron 桌面端
│   │   ├── index.js          # Electron 主进程
│   │   ├── preload.js        # 预加载脚本
│   │   ├── package.json      # Electron 配置
│   │   └── forge.config.js   # Electron Forge 配置
│   │
│   └── mini-program/         # 微信小程序
│       ├── app.js            # 小程序入口
│       ├── app.json          # 小程序配置
│       └── pages/
│           ├── index/        # 首页
│           ├── logs/         # 日志页
│           └── webview/      # WebView 页面
│
├── preview/                   # 文档
│   └── API.md                # 数字人 API 文档
│
└── assets/                    # 静态资源 (运行时生成)
    └── {avatar_id}/          # 各角色的资源目录
        ├── thumbnail.jpg     # 角色缩略图
        ├── 01.webm           # 数字人视频
        ├── combined_data.json.gz # 数字人资源包
        └── memory.bin        # 记忆数据
```

---

## ⚡ 核心功能模块和工作流程

### 1. 语音识别与对话 (ASR + LLM + TTS)

#### 工作流程

```
┌──────────────────────────────────────────────────────────────────┐
│                      实时语音对话流程                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 用户点击开始 → 初始化音频录制器                               │
│          ↓                                                       │
│  2. VAD 检测人声 → 检测到语音活动                                │
│          ↓                                                       │
│  3. 建立 WebSocket 连接 → 连接 Paraformer ASR 服务               │
│          ↓                                                       │
│  4. 发送 PCM 音频流 → 实时传输音频数据                           │
│          ↓                                                       │
│  5. 接收识别文本 → ASR 返回文本结果                              │
│          ↓                                                       │
│  6. 向量检索记忆 → 从记忆库检索相关上下文                        │
│          ↓                                                       │
│  7. 发送 SSE 请求 → 请求 LLM 流式响应                            │
│          ↓                                                       │
│  8. 建立 TTS WebSocket → 连接 CosyVoice 服务                     │
│          ↓                                                       │
│  9. 流式接收文本 → 同时发送给 TTS                                │
│          ↓                                                       │
│  10. 播放合成音频 → AudioWorklet 播放 PCM                        │
│          ↓                                                       │
│  11. 对话结束 → 保存会话记录，后台生成记忆                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 关键代码位置

- 前端核心逻辑: [web/js/dialogRealtime.js](web/js/dialogRealtime.js)
- ASR WebSocket 封装: [web/js/paraformerRealtimeApi.js](web/js/paraformerRealtimeApi.js)
- TTS WebSocket 封装: [web/js/cosyvoiceApi.js](web/js/cosyvoiceApi.js)
- 音频播放器: [web/js/audioPlayer.js](web/js/audioPlayer.js)
- 后端流式响应: [utils/llm_streaming.py](utils/llm_streaming.py)

### 2. 语音克隆系统

#### 工作流程

```
┌──────────────────────────────────────────────────────────────────┐
│                        语音克隆流程                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 用户录制/上传音频 → 8-20秒音频文件                           │
│          ↓                                                       │
│  2. 上传至 OSS → 存储到阿里云 OSS                                │
│          ↓                                                       │
│  3. 调用克隆 API → DashScope VoiceEnrollmentService              │
│          ↓                                                       │
│  4. 生成 cosyvoice_id → 返回音色 ID                              │
│          ↓                                                       │
│  5. 合成测试音频 → 使用新音色合成测试语音                        │
│          ↓                                                       │
│  6. 上传测试音频 → 存储到 OSS                                    │
│          ↓                                                       │
│  7. 更新数据库 → 保存音色信息到 SQLite                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 关键代码位置

- 前端克隆逻辑: [web/js/voiceClone.js](web/js/voiceClone.js)
- 后端克隆 API: [routers/voice.py](routers/voice.py)
- 音色设置: [web/js/characterSetting.js](web/js/characterSetting.js)

### 3. 智能记忆系统

#### 记忆存储格式

```python
# 二进制文件格式 (memory.bin)
┌─────────────────────────────────────────┐
│ 头部信息                                  │
│ ├── avatar_id_len (4 bytes)             │
│ ├── avatar_id (variable)                 │
│ ├── memory_version (4 bytes)            │
│ ├── created_at (4 bytes)                 │
│ ├── updated_at (4 bytes)                 │
│ ├── num_entries (4 bytes)                │
│ └── dim (4 bytes) - 向量维度 768        │
├─────────────────────────────────────────┤
│ 向量数据区                                │
│ ├── vector (dim * 2 bytes) - float16    │
│ ├── norm (2 bytes)                       │
│ ├── frequency (4 bytes)                  │
│ ├── created_at (4 bytes)                 │
│ └── updated_at (4 bytes)                 │
│ (重复 num_entries 次)                    │
├─────────────────────────────────────────┤
│ 文本数据区                                │
│ ├── text_len (4 bytes)                   │
│ └── text (variable, UTF-8)              │
│ (重复 num_entries 次)                    │
└─────────────────────────────────────────┘
```

#### 记忆生成流程

```
会话结束 (600秒无活动)
        │
        ▼
┌─────────────────────────┐
│ 加载现有记忆库          │
│ (从 memory.bin)         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 提取记忆片段            │
│ (LLM 分析对话历史)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 生成文本向量            │
│ (text-embedding-v4)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 搜索相似记忆            │
│ (余弦相似度 > 0.7)      │
└───────────┬─────────────┘
            │
            ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
创建新记忆      合并现有记忆
    │               │
    └───────┬───────┘
            │
            ▼
┌─────────────────────────┐
│ 保存记忆库              │
│ (上传到 OSS/API)        │
└─────────────────────────┘
```

#### 关键代码位置

- 记忆管理器: [utils/memory.py](utils/memory.py)
- 会话管理: [utils/session_manager.py](utils/session_manager.py)
- 前端向量检索: [web/js/embedding.js](web/js/embedding.js)

### 4. 数字人形象创建

#### 工作流程

```
┌──────────────────────────────────────────────────────────────────┐
│                     数字人形象创建流程                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 用户上传图片/视频 → 支持 JPG/PNG/MP4/MOV 格式                │
│          ↓                                                       │
│  2. 前端验证 → 文件大小、尺寸、格式检查                          │
│          ↓                                                       │
│  3. 调用申请 API → 检查创建额度                                  │
│          ↓                                                       │
│  4. 上传至 matesx.cn → 调用数字人生成服务                        │
│          ↓                                                       │
│  5. 后台轮询状态 → 每 20 秒查询一次任务状态                      │
│          ↓                                                       │
│  6. 获取生成结果 → 缩略图、视频、资源包 URL                      │
│          ↓                                                       │
│  7. 更新数据库 → 保存角色信息                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```
### 🎭 1. 角色管理模块（`routers/auth.py`）

管理用户的 AI 数字人形象，支持完整的角色生命周期：

| 功能 | 接口 | 说明 |
|------|------|------|
| 创建新形象 | `POST /auth/apply_new_role` | 检查余额，分配 UUID 形象 ID |
| 上传形象图片 | `POST /auth/handle_new_role2` | 上传图片至 matesx.cn 训练平台，创建后台异步轮询任务（每 20s 一次，最多轮询 20 分钟） |
| 查询制作状态 | `POST /auth/check_role_status` | 实时查询训练进度（pending / processing / success / failed） |
| 更新角色设定 | `POST /auth/update_role` | 修改 system_prompt、声线等；同时清除对应会话缓存 |
| 删除角色 | `POST /auth/remove_role` | 从数据库移除指定角色 |

**形象创建工作流：**
```
用户上传图片
    │
    ▼ POST /auth/handle_new_role2
写入 DB（status=pending）
    │
    ▼ 异步调用 matesx.cn/api/upload
    │
    ▼ asyncio.create_task(poll_task_status)
后台每 20s 轮询 matesx.cn/api/task/{avatar_id}
    │
    ▼ 成功 / 失败
更新 DB（avatar_url, video_url, status）
```

---

### 💬 2. 流式对话模块（`routers/chat.py` + `utils/llm_streaming.py`）

实现与 AI 角色的**低延迟流式对话**：

- 校验用户 `token_balance`，余额不足立即中断
- 通过 `session_manager` 获取/创建会话，自动注入：
  - 角色人格设定（`system_prompt`）
  - 历史记忆摘要（`memory_prompt`，由向量检索召回）
- 使用独立线程调用 `qwen-plus` 模型，通过 `Queue` 桥接异步/同步边界
- 以 **NDJSON 格式**流式推送文本片段到客户端
- 对话结束后自动将消息对追加到 `Session.messages`（最多保留 100 条）

**流式输出格式：**
```json
// 文本片段
{"text": "你好", "endpoint": false}
// 结束标志
{"text": "", "endpoint": true}
// 错误
{"error": "Token不足", "endpoint": true}
```

---

### 🧠 3. 长期记忆模块（`utils/memory.py` + `utils/session_manager.py`）

MatesX 的核心竞争力——**AI 跨会话记忆**：

**记忆处理流程（后台异步，会话超时 600s 后触发）：**

```
对话历史 messages[]
    │
    ▼ MemoryManager.extract_memory_fragments()
LLM（qwen-plus）提取关键信息片段
    │  → 用户偏好、重要事件、达成共识、情感倾向 ...
    ▼
get_embeddings()  →  text-embedding-v4（768 维）
    │
    ▼ search_similar_memories（余弦相似度 ≥ 0.7，Top-5）
    │
    ├─ 相似度高 → decide_memory_integration() → merge_with LLM 合并
    ├─ 全新信息 → create_new
    └─ 不重要  → ignore
    │
    ▼ 序列化为紧凑二进制格式（float16 向量 + 元数据）
上传至 OSS / 本地 /api/assets/{avatar_id}/memory.bin
    │
    ▼
更新 DB memory_version++, memory_prompt_url
```

**记忆注入 Prompt 示例：**
```
你在 2024-06-01 提到：「我叫张三，住在北京」
你多次提到：「我是软件工程师」（共 3 次，首次于 2024-06-01）
```

---

### 🗣️ 4. 语音克隆模块（`routers/voice.py`）

基于阿里 **CosyVoice v2** 实现个性化声音复刻：

| 步骤 | 接口 | 说明 |
|------|------|------|
| 1. 申请名额 | `POST /voice/apply_new_voice` | 检查 voice_balance，生成 voice_id |
| 2. 上传录音 | 前端直传 OSS | 录音文件上传至阿里云 OSS |
| 3. 触发克隆 | `POST /voice/handle_new_voice` | 后台调用 VoiceEnrollmentService 创建声音，合成测试音频并上传 OSS |
| 4. 查询状态 | `POST /voice/check_voice_status` | 检查克隆进度 |
| 5. 删除声音 | `POST /voice/delete_voice` | 从数据库移除语音 |

---

#### 关键代码位置

- 前端创建逻辑: [web/js/createRole.js](web/js/createRole.js)
- 后端创建 API: [routers/auth.py](routers/auth.py)
- 数字人 API 文档: [preview/API.md](preview/API.md)

---

## ⚙️ 部署指南

### 环境要求

- **Python**: 3.8 或更高版本
- **操作系统**: Windows / Linux / macOS
- **网络**: 需要访问阿里云 DashScope API

### 1. 克隆项目

```bash
git clone https://github.com/kleinlee/MatesX.git
cd MatesX
```

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 3. 配置 API 密钥

编辑 `utils/dashscope.py` 文件，配置必要的 API 密钥：

```python
# utils/dashscope.py

# 阿里云 DashScope API Key（必需）
DASHSCOPE_API_KEY = "your_dashscope_api_key"

# matesx.cn 授权密钥（用于数字人生成）
MatesX_key = "your_matesx_key"

# 是否使用腾讯 TTS（可选）
USE_TENCENT_TTS = False

class TencentTtsConfig:
    SECRET_ID = ""  # 腾讯云 Secret ID
    SECRET_KEY = "" # 腾讯云 Secret Key
    APP_ID = None   # 腾讯云 App ID
```

### 4. 启动服务

```bash
# 开发模式
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. 访问应用

打开浏览器访问：`http://localhost:8000/web/home.html`

### Docker 部署（可选）

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t matesx .
docker run -p 8000:8000 matesx
```

---

## 📦 API 接口

### 认证相关 API

#### POST /login

用户登录，获取用户信息和角色列表。

**请求体：**
```json
{
  "unionid": "user_unique_id"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "userInfo": {
    "unionid": "user_unique_id",
    "roles_list": [...],
    "voices_list": [...],
    "bg_list": [...],
    "token_balance": 1000,
    "tencentTTS": 0
  }
}
```

---

### 对话相关 API

#### POST /chat/chat_stream

流式对话接口，返回 SSE 格式的响应流。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "avatar_id": "avatar_id",
  "prompt": "用户输入的文本",
  "memory_prompt": [
    {"text": "记忆文本", "frequency": 1, "createdAt": 1234567890}
  ]
}
```

**响应格式：** Server-Sent Events (SSE)
```
{"text": "响应文本片段", "endpoint": false}
{"text": "", "endpoint": true}
```

---

### 角色管理 API

#### POST /auth/apply_new_role

申请创建新角色。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "avatar_name": "角色名称"
}
```

#### POST /auth/handle_new_role2

上传角色图片/视频。

**请求格式：** multipart/form-data

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| unionid | string | 用户 ID |
| avatar_id | string | 角色 ID |
| avatar_name | string | 角色名称 |
| matting | bool | 是否抠图 |
| keepsize | bool | 是否保持原始尺寸 |
| reverse | bool | 是否正反拼接视频 |
| file | file | 图片/视频文件 |

#### POST /auth/update_role

更新角色信息。

**请求体：**
```json
{
  "avatar_id": "avatar_id",
  "unionid": "user_unique_id",
  "avatar_name": "新名称",
  "cosyvoice_id": "voice_id",
  "system_prompt": "角色设定"
}
```

#### POST /auth/remove_role

删除角色。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "avatar_id": "avatar_id"
}
```

#### POST /auth/check_role_status

查询角色创建状态。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "avatar_id": "avatar_id"
}
```

---

### 语音克隆 API

#### POST /voice/apply_new_voice

申请语音克隆。

**请求体：**
```json
{
  "unionid": "user_unique_id"
}
```

#### POST /voice/handle_new_voice

处理语音克隆请求。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "voice_id": "voice_id",
  "voice_name": "音色名称",
  "voice_url": "音频文件 URL"
}
```

#### POST /voice/check_voice_status

查询语音克隆状态。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "voice_id": "voice_id"
}
```

#### POST /voice/delete_voice

删除自定义音色。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "voice_id": "voice_id"
}
```

---

### 记忆管理 API

#### PUT /api/assets/{avatar_id}/memory.bin

上传记忆数据。

**请求体：** 二进制数据

**响应：**
```json
{
  "message": "Upload successful",
  "path": "assets/{avatar_id}/memory.bin"
}
```

#### GET /api/assets/{avatar_id}/memory.bin

下载记忆数据。

**响应：** 二进制数据流

---

### Token 管理 API

#### POST /generate_temp_token

生成临时访问令牌。

**请求体：**
```json
{
  "unionid": "user_unique_id",
  "model_name": "ali",
  "voice_id": "voice_id"
}
```

**响应：**
```json
{
  "token": "st-xxxx",
  "expires_at": 1744080369
}
```

---

## 💡 常见问题

### 配置问题

#### Q: 启动时报错 "DASHSCOPE_API_KEY 未配置"

**A:** 编辑 `utils/dashscope.py` 文件，设置有效的阿里云 DashScope API Key：

```python
DASHSCOPE_API_KEY = "sk-your-api-key"
```

获取方式：访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)

#### Q: 启动时报错 "MatesX_key 未配置"

**A:** 编辑 `utils/dashscope.py` 文件，设置 matesx.cn 授权密钥：

```python
MatesX_key = "your_matesx_key"
```

可通过联系 matesx.cn 官方获取密钥，新用户可获得免费额度。

#### Q: 如何切换到腾讯 TTS？

**A:** 修改配置文件：

```python
USE_TENCENT_TTS = True

class TencentTtsConfig:
    SECRET_ID = "your_secret_id"
    SECRET_KEY = "your_secret_key"
    APP_ID = "your_app_id"
```

---

### 部署问题

#### Q: 数据库初始化失败

**A:** 检查当前目录是否有写入权限。数据库文件 `users.db` 会在首次启动时自动创建。如果问题持续，可手动初始化：

```bash
cd MatesX
python -c "from utils.sqlite_manager import init_db, init_insert_data; init_db(); init_insert_data()"
```

#### Q: 端口 8000 被占用

**A:** 使用其他端口启动：

```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

#### Q: HTTPS 环境下 WebCodecs API 报错

**A:** WebCodecs API 要求安全上下文（HTTPS 或 localhost）。请确保：
- 本地开发使用 `localhost` 而非 `127.0.0.1`
- 生产环境配置 HTTPS 证书

---

### 使用问题

#### Q: 语音识别不准确

**A:** 可能原因及解决方案：
1. **网络延迟**：检查与阿里云服务的网络连接
2. **麦克风质量**：使用质量较好的麦克风
3. **环境噪音**：在安静环境下使用

#### Q: 语音克隆失败

**A:** 检查以下几点：
1. 音频时长需在 8-20 秒之间
2. 音频格式支持：MP3、WAV、M4A
3. 音频大小不超过 10MB
4. 音频内容需为清晰的人声

#### Q: 角色创建一直显示 "pending"

**A:** 数字人生成通常需要 5-15 分钟，请耐心等待。如果超过 20 分钟仍未完成，可能是：
1. 上传的图片/视频不符合要求
2. matesx.cn 服务繁忙
3. 检查网络连接

#### Q: 对话响应很慢

**A:** 可能原因：
1. **LLM 响应慢**：通义千问首 token 响应通常需要 1-3 秒
2. **TTS 合成慢**：语音合成需要处理时间
3. **网络延迟**：检查服务器与阿里云 API 的网络延迟

#### Q: 如何清除对话记忆？

**A:** 记忆数据存储在：
- 服务端：`assets/{avatar_id}/memory.bin`
- 客户端：IndexedDB `memoryDataDB`

可通过删除对应文件清除记忆，或在角色设置中清空。

---

### 平台特定问题

#### Q: 微信小程序无法加载

**A:** 确保：
1. 在微信公众平台配置业务域名
2. 小程序 WebView 支持的域名已备案

#### Q: Electron 打包后无法运行

**A:** 检查：
1. Electron Forge 配置是否正确
2. 目标 URL 是否可访问
3. 查看控制台错误日志

#### Q: Android 应用闪退

**A:** 检查：
1. AndroidManifest.xml 权限配置
2. 网络权限是否添加
3. WebView 版本兼容性

---

## 许可证

本项目采用 ISC 许可证。

---

## 联系方式

- 项目地址：[GitHub - MatesX](https://github.com/kleinlee/MatesX)
- 数字人服务：[matesx.cn](https://www.matesx.cn)
