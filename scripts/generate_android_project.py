import os
import shutil
import zipfile
import subprocess

PROJECT_DIR = '/tmp/CashKhataAndroid'
PUBLIC_DIR = '/app/applet/public'
ZIP_OUTPUT = os.path.join(PUBLIC_DIR, 'CashKhata-Android-Project.zip')

if os.path.exists(PROJECT_DIR):
    shutil.rmtree(PROJECT_DIR)

# Directory Structure
dirs_to_create = [
    f"{PROJECT_DIR}/app/src/main/java/com/cashkhata/vyaparledger",
    f"{PROJECT_DIR}/app/src/main/res/values",
    f"{PROJECT_DIR}/app/src/main/res/values-night",
    f"{PROJECT_DIR}/app/src/main/res/xml",
    f"{PROJECT_DIR}/app/src/main/res/drawable",
    f"{PROJECT_DIR}/app/src/main/res/mipmap-anydpi-v26",
    f"{PROJECT_DIR}/gradle/wrapper",
]
for d in dirs_to_create:
    os.makedirs(d, exist_ok=True)

# Generate mipmap icon sizes from public/app-icon.png
icon_src = os.path.join(PUBLIC_DIR, 'icon-512.png')
mipmap_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

for folder, size in mipmap_sizes.items():
    dest_dir = f"{PROJECT_DIR}/app/src/main/res/{folder}"
    os.makedirs(dest_dir, exist_ok=True)
    dest_file = f"{dest_dir}/ic_launcher.png"
    dest_round = f"{dest_dir}/ic_launcher_round.png"
    if os.path.exists(icon_src):
        subprocess.run(['convert', icon_src, '-resize', f"{size}x{size}", dest_file], check=False)
        subprocess.run(['convert', icon_src, '-resize', f"{size}x{size}", dest_round], check=False)

# Adaptive Icon XMLs for Android 8.0+
with open(f"{PROJECT_DIR}/app/src/main/res/drawable/ic_launcher_background.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#18794E"
        android:pathData="M0,0h108v108h-108z"/>
</vector>
""")

with open(f"{PROJECT_DIR}/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher"/>
</adaptive-icon>
""")

with open(f"{PROJECT_DIR}/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round"/>
</adaptive-icon>
""")

# AndroidManifest.xml
manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cashkhata.vyaparledger">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.CashKhata"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <!-- Official Google AdMob Application ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-2290313694944386~9326363627" />

        <meta-data
            android:name="com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT"
            android:value="false" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize"
            android:windowSoftInputMode="adjustResize"
            android:launchMode="singleTask"
            android:theme="@style/Theme.CashKhata">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
with open(f"{PROJECT_DIR}/app/src/main/AndroidManifest.xml", "w") as f:
    f.write(manifest_content)

# MainActivity.java
main_activity_content = """package com.cashkhata.vyaparledger;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;
    private static final String APP_URL = "https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Google Mobile Ads SDK for AdMob units
        MobileAds.initialize(this, new OnInitializationCompleteListener() {
            @Override
            public void onInitializationComplete(InitializationStatus status) {}
        });

        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(0xFF18794E);

        webView = new WebView(this);
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setVisibility(View.GONE);

        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, 8
        );
        rootLayout.addView(webView);
        rootLayout.addView(progressBar, pbParams);
        setContentView(rootLayout);

        // Configure WebView performance and offline cache
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                view.loadUrl(url);
                return true;
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"""
with open(f"{PROJECT_DIR}/app/src/main/java/com/cashkhata/vyaparledger/MainActivity.java", "w") as f:
    f.write(main_activity_content)

# colors.xml
colors_content = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#18794E</color>
    <color name="primary_dark">#0F5132</color>
    <color name="accent">#0288D1</color>
    <color name="status_bar">#18794E</color>
    <color name="navigation_bar">#FFFFFF</color>
</resources>
"""
with open(f"{PROJECT_DIR}/app/src/main/res/values/colors.xml", "w") as f:
    f.write(colors_content)

# strings.xml
strings_content = """<resources>
    <string name="app_name">Cash Khata</string>
    <string name="package_name">com.cashkhata.vyaparledger</string>
    <string name="admob_app_id">ca-app-pub-2290313694944386~9326363627</string>
    <string name="admob_native_unit_id">ca-app-pub-2290313694944386/4138535992</string>
    <string name="admob_interstitial_unit_id">ca-app-pub-2290313694944386/3619661243</string>
    <string name="admob_app_open_unit_id">ca-app-pub-2290313694944386/4138535992</string>
</resources>
"""
with open(f"{PROJECT_DIR}/app/src/main/res/values/strings.xml", "w") as f:
    f.write(strings_content)

# styles.xml
styles_content = """<resources>
    <style name="Theme.CashKhata" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">@color/status_bar</item>
        <item name="android:navigationBarColor">@color/navigation_bar</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
    </style>
</resources>
"""
with open(f"{PROJECT_DIR}/app/src/main/res/values/styles.xml", "w") as f:
    f.write(styles_content)

# proguard-rules.pro
proguard_rules = """# Keep Google Mobile Ads SDK
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Keep WebView JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
"""
with open(f"{PROJECT_DIR}/app/proguard-rules.pro", "w") as f:
    f.write(proguard_rules)

# app/build.gradle
app_gradle = """plugins {
    id 'com.android.application'
}

android {
    namespace 'com.cashkhata.vyaparledger'
    compileSdk 34

    defaultConfig {
        applicationId "com.cashkhata.vyaparledger"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
"""
with open(f"{PROJECT_DIR}/app/build.gradle", "w") as f:
    f.write(app_gradle)

# project build.gradle
project_gradle = """buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
"""
with open(f"{PROJECT_DIR}/build.gradle", "w") as f:
    f.write(project_gradle)

# settings.gradle
settings_gradle = """pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CashKhata"
include ':app'
"""
with open(f"{PROJECT_DIR}/settings.gradle", "w") as f:
    f.write(settings_gradle)

# gradle.properties
gradle_properties = """org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
"""
with open(f"{PROJECT_DIR}/gradle.properties", "w") as f:
    f.write(gradle_properties)

# gradle-wrapper.properties
wrapper_properties = """distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
"""
with open(f"{PROJECT_DIR}/gradle/wrapper/gradle-wrapper.properties", "w") as f:
    f.write(wrapper_properties)

# gradlew (Linux/macOS)
gradlew_content = """#!/bin/sh
APP_BASE_NAME=`basename "$0"`
DIRNAME=`dirname "$0"`
[ -z "$DIRNAME" ] && DIRNAME=.
APP_HOME=`cd "$DIRNAME" && pwd`
exec "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" "$@"
"""
with open(f"{PROJECT_DIR}/gradlew", "w") as f:
    f.write(gradlew_content)
os.chmod(f"{PROJECT_DIR}/gradlew", 0o755)

# GOOGLE_PLAY_GUIDE.md
guide_content = """# 🚀 How to Build Google Play Package (.AAB) in Android Studio

This project is 100% pre-configured for Google Play Store publication with your official package name, icons, and AdMob IDs.

---

### Step 1: Open the Project in Android Studio
1. Download and extract **`CashKhata-Android-Project.zip`**.
2. Open **Android Studio** and click **File > Open...**.
3. Select the extracted folder and let Gradle sync.

---

### Step 2: Build Google Play Store Bundle (.AAB)
1. In Android Studio's top menu, click:
   **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Under **Key store path**, click **Create new...**:
   - Choose a location on your computer to save your `.jks` keystore file.
   - Enter a password and Alias (e.g., `cashkhata_key`).
   - Fill in your name/organization.
   - Click **OK**.
4. Select **release** build variant and click **Create**.
5. Your Google Play `.aab` file will be generated in:
   `app/release/app-release.aab`
6. Upload this **`app-release.aab`** directly to **Google Play Console**!

---

### Step 3: Build Debug APK for Testing (.APK)
If you want to install and test on your Android phone immediately:
1. In Android Studio, click:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. The `.apk` will be output to:
   `app/build/outputs/apk/debug/app-debug.apk`
3. Sideload it onto any Android phone and install!

---

### App Identity & AdMob Verification
- **Package Name**: `com.cashkhata.vyaparledger`
- **Application ID**: `ca-app-pub-2290313694944386~9326363627`
- **Target SDK**: `34` (Android 14 - compliant with Google Play target API policy)
"""
with open(f"{PROJECT_DIR}/GOOGLE_PLAY_GUIDE.md", "w") as f:
    f.write(guide_content)

# Zip the project
with zipfile.ZipFile(ZIP_OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(PROJECT_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, PROJECT_DIR)
            zipf.write(full_path, rel_path)

print(f"Android Project ZIP successfully created at {ZIP_OUTPUT} ({os.path.getsize(ZIP_OUTPUT)} bytes)")
