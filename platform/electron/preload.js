const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // 创建拖动区域元素
  const dragRegion = document.createElement('div');
  dragRegion.className = 'electron-drag-region';

  // 添加到body
  document.body.appendChild(dragRegion);

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .electron-drag-region {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 16px;
      -webkit-app-region: drag;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.02);
//      background-color: transparent;
    }

    .electron-drag-region:hover {
      cursor: move;
    }
  `;
  document.head.appendChild(style);

  // 防止拖动区域干扰页面内容点击
  dragRegion.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  dragRegion.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  });
});