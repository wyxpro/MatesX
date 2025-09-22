[中文版](README_zh.md) | [English](README.md)

# 🌟 MatesX — Lightweight Multi-platform Digital Human Engine

> Next-generation digital human interaction framework designed for massive C-end users — Memory · Expression · Motion · Multi-platform · Lightweight

---

## 🎯 Project Mission
- Enable individual users to customize their own AI companions
- Support ultra-high concurrency digital human services targeting massive C-end users

### Three Core Objectives:

1. ✅ Large-scale C-end Digital Human Conversation Management
Supports high-concurrency, low-latency, stable and reliable conversation services, designed to run on ordinary servers.

2. ✅ Memory, Expression & Motion Management
Next-generation digital human driving engine, integrating memory engine + real-time emotion analysis + free expression & motion control, making digital humans “remember, feel, and move freely”.

3. ✅ Cross-platform Support for Desktop, APP, Mini Programs with Ultra-lightweight Architecture
One core engine adapts to Windows/macOS desktop, iOS/Android APPs, WeChat/Alipay Mini Programs — extremely lightweight and rapidly integrable.

---

## 🚀 Core Features

### 1. 🗣️ End-to-End Digital Human Conversation Engine
> VAD (Voice Activity Detection) → ASR (Automatic Speech Recognition) → LLM (Large Language Model) → TTS (Text-to-Speech) → Digital Human Animation

### 2. 🧠 mem0-Level Memory Functionality
- Fusion of long-term and short-term memory, supporting personalized dialogue history storage and contextual understanding
- Dynamic user profiling, persistent memory with cross-device synchronization

### 3. 😊 Real-time Emotion Analysis
- Multimodal emotion recognition based on voice tone, semantic content, and dialogue rhythm
- Outputs emotion tags (happy/sad/angry/surprised, etc.) to drive facial expressions and vocal intonation

### 4. 🎭 Free Expression & Free Motion
- Driven by large-model algorithms, supports skeletal/BlendShape animation
- Automatically matches facial expressions and body language in real-time based on dialogue content and emotional state

---

## 📱 Multi-platform Support

| Platform | Status | Tech Stack | Preview | |
|-----------------|--------|----------------|-------------------------------------------|-----------------------------------------------------------------------------------------|
| Windows | ✅ | electron | <img src="preview/windows.jpg" width="120" /> | exe link |
| macOS | ✅ | electron | ||
| Android app | ✅ | webview | <img src="preview/android.jpg" width="120" /> | apk link |
| WeChat Mini Program | ✅ | webview | <img src="preview/mini-program.jpg" width="120" /> | #小程序://MatesX数字生命/2ZvtOmy4Vfv1Chi | |
| Web | ✅ | WebGL rendering support | <img src="preview/web.jpg" width="120" /> | web link |
> 💡 All platforms share the same core engine, code reuse rate > 99%, extremely lightweight (core module < 5MB)

---

## 🛠️ Quick Start

```bash 
```bash
git clone https://github.com/kleinlee/MatesX.git
cd MatesX
pip install -r requirements.txt
```
Deploy cloud-based conversation & speech models (Alibaba DashScope)

Modify utils/dashscope.py:
```bash
# Configure LLM-specific API
DASHSCOPE_API_KEY = ""     # Obtain API-key from Alibaba Cloud Bailian
DASHSCOPE_TOKEN_URL = "https://dashscope.aliyuncs.com/api/v1/tokens"
DASHSCOPE_LLM_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
# Configure your domain server (or use localhost for local only)
HOST_URL = "http://localhost:8000"
```

Start service:
```bash
python main.py
```
Then open http://localhost:8000/web/home.html to enjoy!

### Multi-platform Compilation (Windows, macOS, Android, Mini Program)
Refer to the platform folder

### High Concurrency & Cloud Sync
- Upgrade to cloud database
- Host resources on OSS

## License
Apache License 2.0

## Contact
| join WeChat group                                                                        | Join QQ group                                                                            |
|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| ![微信交流群](https://github.com/user-attachments/assets/b1f24ebb-153b-44b1-b522-14f765154110) | ![QQ群聊](https://github.com/user-attachments/assets/29bfef3f-438a-4b9f-ba09-e1926d1669cb) |

