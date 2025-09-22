// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          // 将 code 发送至后端换取 openid
          wx.request({
            url: 'https://www.matesx.com/api/auth/wechat_mp/login',
            data: { code: res.code },
            success: (response) => {
              
              const openid = response.data.openid; 
              this.globalData.openid = openid; // 存储到全局
              const unionid = response.data.unionid; 
              this.globalData.unionid = unionid; // 存储到全局
              console.log("openid", this.globalData.openid);
            }
          });
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid: null // 新增 openid 字段
  },
  // 用户点击右上角分享给好友
  onShareAppMessage: function() {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })
  },
  // 用户点击右上角分享到朋友圈
  onShareTimeline: function() {
    return {
      title:'',
      query:{
        key:value
      },
      imageUrl:''
    }
  }
})
