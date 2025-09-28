const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 360,
    height: 640,
    minWidth: 240,
    minHeight: 240,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js') // 添加preload脚本
    },
    transparent: true,
    frame: false
  });

  // 加载URL
  mainWindow.loadURL('https://matesx.com/?Desktop');

  // 页面加载完成后注入CSS和JS
  mainWindow.webContents.on('did-finish-load', () => {
    // 注入CSS样式
    mainWindow.webContents.insertCSS(`
      .electron-drag-region {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 16px;
        -webkit-app-region: drag;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.02);
//        background-color: transparent;
      }

      .electron-drag-region:hover {
        cursor: move;
      }
    `);

    // 注入JavaScript来创建拖动区域
    mainWindow.webContents.executeJavaScript(`
      // 创建拖动区域元素
      const dragRegion = document.createElement('div');
      dragRegion.className = 'electron-drag-region';

      // 添加到body
      document.body.appendChild(dragRegion);

      // 防止拖动区域干扰页面内容点击
      dragRegion.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      dragRegion.addEventListener('mouseup', (e) => {
        e.stopPropagation();
      });
    `).catch(err => console.log('注入JS失败:', err));
  });
  mainWindow.webContents.on('before-input-event', (event, input) => {
  if (input.key === 'F12') {
    mainWindow.webContents.toggleDevTools();
    event.preventDefault();
  }
});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});