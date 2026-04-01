package com.sccleague.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;

public class MainActivity extends AppCompatActivity {
    private static final String APP_URL = "https://liga-scc.web.app/";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        openLeagueSite();
    }

    private void openLeagueSite() {
        Uri uri = Uri.parse(APP_URL);

        try {
            CustomTabsIntent customTabsIntent = new CustomTabsIntent.Builder().build();
            customTabsIntent.intent.setPackage("com.android.chrome");
            customTabsIntent.launchUrl(this, uri);
            finish();
            return;
        } catch (ActivityNotFoundException ignored) {
            // Fallback to default browser below.
        } catch (Exception ignored) {
            // Fallback to default browser below.
        }

        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(browserIntent);
            finish();
        } catch (Exception error) {
            Toast.makeText(this, "No se pudo abrir COPA SCC.", Toast.LENGTH_LONG).show();
            finish();
        }
    }
}
