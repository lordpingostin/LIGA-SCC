package com.sccleague.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String APP_URL = "https://liga-scc.web.app/";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/index.html";

    private WebView webView;
    private View loadingOverlay;
    private ProgressBar loadingBar;
    private TextView loadingText;
    private boolean usingLocalFallback = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.mainWebView);
        loadingOverlay = findViewById(R.id.loadingOverlay);
        loadingBar = findViewById(R.id.loadingBar);
        loadingText = findViewById(R.id.loadingText);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new LeagueWebViewClient());
        webView.loadUrl(APP_URL);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
    }

    private void showLoading(String message) {
        loadingOverlay.setVisibility(View.VISIBLE);
        loadingBar.setVisibility(View.VISIBLE);
        loadingText.setVisibility(View.VISIBLE);
        loadingText.setText(message);
    }

    private void hideLoading() {
        loadingOverlay.setVisibility(View.GONE);
        loadingBar.setVisibility(View.GONE);
        loadingText.setVisibility(View.GONE);
    }

    private boolean shouldStayInsideApp(@NonNull Uri uri) {
        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (scheme == null) {
            return false;
        }

        if ("file".equalsIgnoreCase(scheme)) {
            return true;
        }

        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            return false;
        }

        return host != null && (host.equals("liga-scc.web.app") || host.endsWith(".gstatic.com") || host.endsWith(".firebaseapp.com"));
    }

    private void loadLocalFallback() {
        if (usingLocalFallback) {
            return;
        }

        usingLocalFallback = true;
        showLoading("Abriendo respaldo local de LIGA SCC...");
        webView.loadUrl(LOCAL_FALLBACK_URL);
    }

    private void openExternal(@NonNull Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception ignored) {
            // Ignore external launch failures and keep the user inside the app.
        }
    }

    private final class LeagueWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (shouldStayInsideApp(uri)) {
                return false;
            }

            openExternal(uri);
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            showLoading("Cargando LIGA SCC...");
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            hideLoading();
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
            super.onReceivedHttpError(view, request, errorResponse);
            if (request.isForMainFrame() && !usingLocalFallback) {
                loadLocalFallback();
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame() && !usingLocalFallback) {
                loadLocalFallback();
            }
        }
    }
}
