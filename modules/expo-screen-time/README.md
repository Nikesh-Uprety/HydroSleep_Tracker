# Screen Time Native Module

Android native module for tracking screen time using UsageStatsManager.

## Setup Instructions

This module requires native Android code. Since this is an Expo project, you need to use a **development build** (not Expo Go).

### Prerequisites

1. Android SDK installed
2. Android development environment set up
3. Expo CLI installed

### Integration Steps

#### Option 1: Using Expo Prebuild (Recommended)

1. **Generate native Android project:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Copy native module files:**
   - The Kotlin files are already in `modules/expo-screen-time/android/src/main/java/com/hydrosleep/tracker/screentime/`
   - Copy them to: `android/app/src/main/java/com/hydrosleep/tracker/screentime/`

3. **Register the package in MainApplication.java:**
   
   Open `android/app/src/main/java/com/hydrosleep/tracker/MainApplication.java` (or MainApplication.kt) and add:
   
   ```java
   import com.hydrosleep.tracker.screentime.ScreenTimePackage;
   
   // In getPackages() method:
   packages.add(new ScreenTimePackage());
   ```

4. **Update build.gradle:**
   
   Ensure Kotlin is enabled in `android/build.gradle`:
   ```gradle
   buildscript {
     ext {
       kotlinVersion = "1.9.0"
     }
     dependencies {
       classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
     }
   }
   ```
   
   And in `android/app/build.gradle`:
   ```gradle
   apply plugin: "kotlin-android"
   
   dependencies {
     implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion"
   }
   ```

5. **Build the app:**
   ```bash
   npx expo run:android
   ```

#### Option 2: Using EAS Build

1. Create a development build:
   ```bash
   eas build --profile development --platform android
   ```

2. Follow steps 2-4 from Option 1 to integrate the native code before building.

### Permission Setup

The `PACKAGE_USAGE_STATS` permission is already configured in `app.json`. Users must manually enable it in Android Settings:

1. Open the app
2. Navigate to Screen Time tab
3. Tap "Open Usage Access Settings"
4. Find "HydroSleep Tracker" in the list
5. Enable "Permit usage access"

### Testing

1. Build and install the app on an Android device
2. Enable Usage Access permission
3. Navigate to the Screen Time tab
4. Data should start appearing after using other apps

### Troubleshooting

**Module not found error:**
- Ensure the native code is in the correct directory
- Verify the package is registered in MainApplication
- Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx expo run:android`

**Permission not working:**
- Check that permission is declared in AndroidManifest.xml
- Verify user enabled Usage Access in Settings
- Check logcat for permission errors

**No data appearing:**
- UsageStatsManager requires apps to be used before data appears
- Data may take a few minutes to aggregate
- Some system apps may not appear in usage stats

## Code Structure

- `ScreenTimeModule.kt`: Main native module with UsageStatsManager integration
- `ScreenTimePackage.kt`: React Native package registration
- `src/index.ts`: TypeScript bridge interface

## Limitations

- Only tracks FOREGROUND app usage (apps actively visible to user)
- Requires Android 5.1 (API 22) or higher
- UsageStatsManager has aggregation delays (data may not be immediately available)
- Some system apps may not appear in usage statistics
- Permission must be manually granted by user (cannot be requested programmatically)

