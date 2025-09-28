package com.github.kleinlee.matesx

import android.os.Build
import android.os.Bundle
import android.view.WindowInsets
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView = findViewById<WebView>(R.id.webView).apply {
            // 启用 WebView 存储和缓存
            configureWebSettings()

            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient() // 可选：支持进度条等

            // 加载网页
            loadUrl("https://www.matesx.com")
        }
    }

    private fun WebView.configureWebSettings() {
        settings.apply {
            // 基础配置
            javaScriptEnabled = true
            domStorageEnabled = true       // 启用 localStorage

            // 其他优化配置
            allowContentAccess = true
            allowFileAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = true
            displayZoomControls = false
        }

        // 适配系统栏重叠（Android 5.0+）
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            fitsSystemWindows = true
        }

        // 对于 API 30+ 的设备，需要额外处理手势导航
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            setOnApplyWindowInsetsListener { v, insets ->
                val systemBars = insets.getInsets(WindowInsets.Type.systemBars())
                v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
                insets
            }
        }
    }


    override fun onBackPressed() {
        val webView = findViewById<WebView>(R.id.webView)
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}