# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

## Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

## Prevent obfuscation of dotenv
-keep class ** { *; }
-keepclassmembers class ** {
    *;
}

## Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

## Google ML Kit
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }

## Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

## Gemini AI
-keep class com.google.ai.** { *; }
-keep class com.google.generativeai.** { *; }

## Camera
-keep class androidx.camera.** { *; }

## Keep all model classes
-keep class com.loomalabs.signasure.models.** { *; }
