 # 🌟 MatesX — 多端编译（windows、mac、android、小程序）


 ---

 ## 1️⃣ Electron 桌面端编译（支持 Windows 与 macOS）

```bash  
cd electron  
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/  
npm config set registry https://registry.npmmirror.com/  
npm install electron --save-dev  
npm run make 
```
 ✅ 编译完成后，生成的安装包位于：

 electron/out/matesx-win32-x64/ （Windows）
 
或对应平台架构文件夹（如 macOS 为 matesx-darwin-x64/）

 ---

 ## 2️⃣ Android 移动端编译

 1. 使用 Android Studio 打开 android/ 目录。
 2. 点击菜单栏 Build > Build Bundle(s) / APK(s) > Build APK(s)。

 ✅ 编译完成后，生成的 APK 文件位于：
 android/app/build/outputs/apk/

 ---

 ## 3️⃣ mini-program端编译

代码很简单，请按需编译