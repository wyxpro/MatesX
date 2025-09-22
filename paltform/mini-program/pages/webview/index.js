// pages/webview/index.js
Page({
  data: {
    url: '' // 动态设置的 WebView URL
  },

  onLoad(options) {
    if (options.url) {
      this.setData({ url: decodeURIComponent(options.url) });
    }
  }
});