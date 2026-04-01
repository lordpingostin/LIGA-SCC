package com.sccleague.app;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

import com.sccleague.app.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {
    private static final String REMOTE_URL = "https://lordpingostin.github.io/LIGA-SCC/";
    private static final String LOCAL_URL = "https://appassets.androidplatform.net/assets/index.html";

    private ActivityMainBinding binding;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        WebView webView = binding.webView;
        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setWebViewClient(new LeagueWebViewClient(assetLoader));
        webView.loadUrl(REMOTE_URL);
    }

    @Override
    public void onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private class LeagueWebViewClient extends WebViewClient {
        private final WebViewAssetLoader assetLoader;
        private boolean usingFallback;

        LeagueWebViewClient(WebViewAssetLoader assetLoader) {
            this.assetLoader = assetLoader;
            this.usingFallback = false;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(@NonNull WebView view, @NonNull WebResourceRequest request) {
            if (request.getUrl().toString().startsWith("https://appassets.androidplatform.net/assets/")) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
            return super.shouldInterceptRequest(view, request);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            if (url != null && url.startsWith("https://appassets.androidplatform.net/assets/")) {
                return assetLoader.shouldInterceptRequest(android.net.Uri.parse(url));
            }
            return super.shouldInterceptRequest(view, url);
        }

        @Override
        public void onReceivedError(
                WebView view,
                @NonNull WebResourceRequest request,
                @NonNull android.webkit.WebResourceError error
        ) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame() && !usingFallback) {
                usingFallback = true;
                view.loadUrl(LOCAL_URL);
            }
        }

        @Override
        public void onReceivedHttpError(
                WebView view,
                @NonNull WebResourceRequest request,
                @NonNull android.webkit.WebResourceResponse errorResponse
        ) {
            super.onReceivedHttpError(view, request, errorResponse);
            if (request.isForMainFrame() && errorResponse.getStatusCode() >= 400 && !usingFallback) {
                usingFallback = true;
                view.loadUrl(LOCAL_URL);
            }
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            usingFallback = LOCAL_URL.equals(url);
            binding.splashOverlay.animate()
                    .alpha(0f)
                    .setDuration(220)
                    .withEndAction(() -> binding.splashOverlay.setVisibility(android.view.View.GONE))
                    .start();
        }
    }
}
