package com.sccleague.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabColorSchemeParams;
import androidx.browser.customtabs.CustomTabsClient;
import androidx.browser.customtabs.CustomTabsIntent;

public class MainActivity extends AppCompatActivity {
    private static final String APP_URL = "https://liga-scc.web.app/";
    private static final String FALLBACK_URL = "https://liga-scc.web.app/";

    private boolean launchedOnce = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button openButton = findViewById(R.id.openLeagueButton);
        TextView helperText = findViewById(R.id.launchHelperText);

        openButton.setOnClickListener((view) -> launchLeague());
        helperText.setText("La app abre la liga usando Chrome para permitir inicio de sesion con Google.");

        if (savedInstanceState != null) {
            launchedOnce = savedInstanceState.getBoolean("launchedOnce", false);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (!launchedOnce) {
            launchedOnce = true;
            launchLeague();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean("launchedOnce", launchedOnce);
    }

    private void launchLeague() {
        Uri appUri = Uri.parse(APP_URL);
        String customTabsPackage = CustomTabsClient.getPackageName(this, null);

        if (customTabsPackage != null) {
            CustomTabColorSchemeParams darkScheme = new CustomTabColorSchemeParams.Builder()
                .setToolbarColor(0xFF050505)
                .setNavigationBarColor(0xFF050505)
                .build();

            CustomTabsIntent customTabsIntent = new CustomTabsIntent.Builder()
                .setShowTitle(false)
                .setShareState(CustomTabsIntent.SHARE_STATE_OFF)
                .setDefaultColorSchemeParams(darkScheme)
                .setColorScheme(CustomTabsIntent.COLOR_SCHEME_DARK)
                .build();

            customTabsIntent.intent.setPackage(customTabsPackage);
            customTabsIntent.launchUrl(this, appUri);
            return;
        }

        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(FALLBACK_URL));
        startActivity(browserIntent);
    }
}
