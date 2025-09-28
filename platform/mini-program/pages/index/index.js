// 页面 JS（如 pages/index/index.js）
const app = getApp();

Page({
  data: {
    webviewUrl: ''
  },

  onLoad() {
    this.checkOpenid();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
  },

  checkOpenid() {
    if (app.globalData.openid) {
      this.setWebviewUrl(app.globalData.openid, 
        app.globalData.unionid);
    } else {
      const timer = setInterval(() => {
        if (app.globalData.openid) {
          clearInterval(timer);
          this.setWebviewUrl(app.globalData.openid, 
            app.globalData.unionid);
          console.log("XXX22", app.globalData.openid);
        }
      }, 100);
    }
  },

  setWebviewUrl(openid, unionid) {
    const url = `https://www.matesx.com?mp_openid=${encodeURIComponent(openid)}&unionid=${encodeURIComponent(unionid)}`;
    this.setData({ webviewUrl: url }); 
  },
  // 开启好友转发
  onShareAppMessage() {
    return {
      title: "MatesX数字生命",
      imageUrl: "https://www.matesx.com/common/icon108.png",
      path: '/pages/index/index'
    };
  },

  // 开启朋友圈分享
  onShareTimeline() {
    return {
      title: "MatesX数字生命",
      imageUrl: "https://www.matesx.com/common/icon108.png",
    };
  },
});