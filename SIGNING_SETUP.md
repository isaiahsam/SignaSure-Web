# Android App Signing Setup for Play Store

## Why You Need This

To publish on Google Play Store, you need to sign your app with a **release keystore**. This proves the app comes from you and prevents others from impersonating your app.

## Step 1: Create Upload Keystore

Run this command (replace values in brackets):

```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

**You'll be prompted for:**
- **Keystore password**: Choose a strong password (save it!)
- **Key password**: Can be same as keystore password
- **Name**: Your name or company name
- **Organizational unit**: Your team/department
- **Organization**: Your company name
- **City**: Your city
- **State**: Your state/province
- **Country code**: Two-letter code (US, PH, etc.)

**Example:**
```
Enter keystore password: MyStr0ngP@ssw0rd123
Re-enter new password: MyStr0ngP@ssw0rd123
What is your first and last name? John Doe
What is the name of your organizational unit? Development
What is the name of your organization? Looma Labs
What is the name of your City or Locality? Manila
What is the name of your State or Province? NCR
What is the two-letter country code for this unit? PH
```

This creates: `upload-keystore.jks`

## Step 2: Move Keystore to Safe Location

```bash
# Move to android/app directory
mv upload-keystore.jks android/app/
```

**⚠️ IMPORTANT:**
- **NEVER** commit this file to git!
- **Backup** to a secure location (password manager, encrypted drive)
- If you lose this, you can't update your app!

## Step 3: Create key.properties File

Create `android/key.properties`:

```properties
storePassword=MyStr0ngP@ssw0rd123
keyPassword=MyStr0ngP@ssw0rd123
keyAlias=upload
storeFile=upload-keystore.jks
```

**Replace with your actual values!**

**⚠️ IMPORTANT:**
- This file contains secrets!
- **NEVER** commit to git!

## Step 4: Update build.gradle.kts

Open `android/app/build.gradle.kts` and add this **before** the `android {` block:

```kotlin
// Load keystore properties
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}
```

Then **inside** the `android {` block, **before** `defaultConfig`:

```kotlin
signingConfigs {
    create("release") {
        keyAlias = keystoreProperties["keyAlias"] as String
        keyPassword = keystoreProperties["keyPassword"] as String
        storeFile = file(keystoreProperties["storeFile"] as String)
        storePassword = keystoreProperties["storePassword"] as String
    }
}
```

And update the `buildTypes` → `release` section:

```kotlin
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

## Step 5: Update .gitignore

Add to `android/.gitignore`:

```gitignore
key.properties
*.jks
*.keystore
```

## Step 6: Get SHA-1 for Firebase

Firebase needs your release SHA-1 fingerprint:

```bash
keytool -list -v -keystore android/app/upload-keystore.jks -alias upload
```

Enter your keystore password. Copy the **SHA-1** value.

### Add to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings
3. Under "Your apps" → Select your Android app
4. Scroll to "SHA certificate fingerprints"
5. Click "Add fingerprint"
6. Paste the SHA-1
7. Download the updated `google-services.json`
8. Replace `android/app/google-services.json` with the new file

## Step 7: Test Release Build

```bash
flutter build apk --release
```

or for App Bundle (recommended):

```bash
flutter build appbundle --release
```

If successful, you'll see:
```
✓ Built build/app/outputs/bundle/release/app-release.aab
```

## Step 8: Test on Device

```bash
flutter install --release
```

Test all features:
- Google Sign-In
- Document scanning
- AI analysis
- Everything should work!

## Complete build.gradle.kts Example

```kotlin
import java.util.Properties
import java.io.FileInputStream

// Load keystore properties
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.yourcompany.signasure"  // Change this!
    compileSdk = 36
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }

    defaultConfig {
        applicationId = "com.yourcompany.signasure"  // Change this!
        minSdk = 23
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}
```

## Troubleshooting

### "keystore file not found"
- Check the path in `key.properties`
- Ensure `upload-keystore.jks` is in `android/app/`

### "incorrect password"
- Double-check password in `key.properties`
- Passwords are case-sensitive!

### "Unresolved reference: keystoreProperties"
- Ensure import statements are at the top
- Check Properties import: `import java.util.Properties`

### Build fails with signing errors
- Verify `key.properties` file exists
- Check all values are correct (no typos)
- Ensure keystore file exists

## Security Checklist

✅ `.gitignore` includes:
- `key.properties`
- `*.jks`
- `*.keystore`

✅ Keystore backed up to:
- Password manager (1Password, LastPass, etc.)
- Encrypted cloud storage
- External hard drive (encrypted)

✅ Never:
- Commit keystore to git
- Share keystore publicly
- Email keystore unencrypted
- Store password in plain text

## Play Console Setup

When uploading to Play Store:

1. **First time**: Upload the `.aab` file
2. **Play Console** → **Release** → **Production**
3. **Create new release**
4. **Upload** `app-release.aab`
5. Google Play App Signing will automatically handle the rest!

**Note:** Google now manages your app signing key. You upload with your upload key, and Google re-signs with the app signing key.

## Key Management Best Practices

### Backup Strategy (DO THIS NOW!)

1. **Keystore file**: `upload-keystore.jks`
   - Store in password manager
   - Upload to encrypted cloud (Google Drive, Dropbox with encryption)
   - Save to external hard drive

2. **key.properties**: Save passwords in password manager
   - Store password: `[password]`
   - Key password: `[password]`
   - Key alias: `upload`

3. **Recovery information**: Save keystore creation date and details

### What If You Lose the Keystore?

**If you haven't published yet:**
- Create a new keystore (no problem!)

**If you've already published:**
- You **CANNOT** update your app
- You'll need to publish as a new app
- All users will need to reinstall
- **This is why backups are critical!**

## Next Steps

After signing is configured:
1. ✅ Test release build
2. ✅ Verify Google Sign-In works in release
3. ✅ Test all app features
4. ✅ Follow PRODUCTION_CHECKLIST.md
5. ✅ Upload to Play Store!

---

**Need help?** Check the [Flutter deployment docs](https://docs.flutter.dev/deployment/android)
