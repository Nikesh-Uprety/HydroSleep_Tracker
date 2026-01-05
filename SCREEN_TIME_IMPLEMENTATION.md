# Screen Time Feature Implementation

Complete implementation of Android screen time tracking for HydroSleep Tracker.

## Overview

This feature tracks app usage on Android devices using the native `UsageStatsManager` API. It provides:
- Real-time app usage tracking
- Daily and weekly statistics
- Visual charts and breakdowns
- Backend synchronization
- Privacy-focused implementation

## Components

### 1. Android Native Module (`modules/expo-screen-time/android/`)

**Files:**
- `ScreenTimeModule.kt`: Main native module implementation
- `ScreenTimePackage.kt`: React Native package registration

**Features:**
- Uses `UsageStatsManager` and `UsageEvents` for accurate tracking
- Tracks only FOREGROUND app usage
- Aggregates data per day, per app
- Handles permission checks and settings navigation

**Key Methods:**
- `isUsageAccessGranted()`: Check if permission is granted
- `openUsageAccessSettings()`: Open Android Settings
- `getScreenTimeData(rangeInDays)`: Fetch usage data (1, 7, or 10 days)

### 2. TypeScript Bridge (`modules/expo-screen-time/src/index.ts`)

Type-safe interface between React Native and native module.

### 3. Service Layer (`services/screenTimeService.ts`)

**Features:**
- Permission management
- Data caching with AsyncStorage
- Error handling
- Data formatting utilities
- Cache invalidation on date change

### 4. Backend API (`server/src/routes/screenTime.js`)

**Endpoints:**
- `POST /api/screen-time/sync`: Sync screen time data
- `GET /api/screen-time/summary`: Get aggregated summary

**Features:**
- JWT authentication
- Data validation
- Upsert strategy (prevent duplicates)
- Aggregated summaries

### 5. Database Model (`server/src/models/ScreenTime.js`)

**Schema:**
```javascript
{
  userId: ObjectId,
  date: String (YYYY-MM-DD),
  appPackage: String,
  appName: String,
  usageMs: Number,
  createdAt: Date
}
```

**Indexes:**
- `userId + date` (efficient queries)
- `userId + appPackage + date` (unique, prevents duplicates)
- `userId + appPackage` (optional, for analytics)

### 6. UI Screen (`screens/ScreenTimeScreen.tsx`)

**Features:**
- Permission request flow with explanation
- Today's total screen time summary
- Daily bar chart (up to 10 days)
- App-wise breakdown (top 20 apps)
- Range selector (24h, 7d, 10d)
- Pull-to-refresh
- Loading and error states

**Charts:**
- Uses `react-native-svg` for custom bar charts
- Matches existing app design system

## Setup Instructions

### For Development

1. **Generate native Android project:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Copy native module files:**
   ```bash
   # Copy Kotlin files to android project
   cp -r modules/expo-screen-time/android/src/main/java/com/hydrosleep/tracker/screentime \
        android/app/src/main/java/com/hydrosleep/tracker/
   ```

3. **Register package in MainApplication:**
   
   Edit `android/app/src/main/java/com/hydrosleep/tracker/MainApplication.java`:
   ```java
   import com.hydrosleep.tracker.screentime.ScreenTimePackage;
   
   // In getPackages() method:
   packages.add(new ScreenTimePackage());
   ```

4. **Configure Kotlin (if not already):**
   
   Ensure Kotlin is set up in `android/build.gradle` and `android/app/build.gradle`.

5. **Build and run:**
   ```bash
   npx expo run:android
   ```

### For Production

Use EAS Build with development profile, then integrate native code as above.

## Permission Flow

1. User opens Screen Time tab
2. App checks if `PACKAGE_USAGE_STATS` permission is granted
3. If not granted:
   - Shows permission explanation screen
   - User taps "Open Usage Access Settings"
   - User enables permission in Android Settings
   - User returns to app
   - App checks permission again
4. If granted:
   - Fetches screen time data
   - Displays charts and statistics

## Data Flow

1. **Collection:**
   - Native module queries `UsageStatsManager`
   - Aggregates events by date and app
   - Returns data to React Native

2. **Caching:**
   - Service layer caches data in AsyncStorage
   - Cache keyed by date and range
   - Invalidated when date changes or user refreshes

3. **Sync:**
   - Data synced to backend on fetch
   - Backend validates and upserts
   - Prevents duplicates via unique index

4. **Display:**
   - UI fetches from cache or service
   - Charts render using react-native-svg
   - App breakdown sorted by usage

## API Usage

### Sync Screen Time Data

```typescript
import { api } from '@/services/api';

const entries = [
  {
    packageName: 'com.example.app',
    appName: 'Example App',
    usageMs: 3600000, // 1 hour in milliseconds
    date: '2025-01-15'
  }
];

const result = await api.syncScreenTime(entries);
```

### Get Summary

```typescript
const summary = await api.getScreenTimeSummary('2025-01-08', '2025-01-15');
```

## Limitations & Considerations

### UsageStatsManager Limitations

1. **Foreground-only tracking:** Only tracks apps in foreground
2. **Aggregation delays:** Data may not be immediately available
3. **System apps:** Some system apps may not appear
4. **Battery optimization:** May affect data collection
5. **Android version:** Requires Android 5.1 (API 22)+

### Privacy

- All data is user-specific
- Stored locally and synced to user's account only
- No data sharing without user consent
- User can revoke permission anytime

### Performance

- No background polling
- Data fetched only on app open or manual refresh
- Caching reduces native API calls
- Efficient aggregation in native code

## Testing Checklist

- [ ] Permission request flow works
- [ ] Settings navigation opens correctly
- [ ] Data appears after using apps
- [ ] Charts render correctly
- [ ] Range selector works (1d, 7d, 10d)
- [ ] Pull-to-refresh works
- [ ] Backend sync succeeds
- [ ] Cache invalidation works
- [ ] Error states display correctly
- [ ] Empty states handled

## Troubleshooting

**Module not found:**
- Verify native code is in correct directory
- Check package registration in MainApplication
- Clean and rebuild project

**Permission issues:**
- Verify permission in AndroidManifest.xml
- Check user enabled in Settings
- Review logcat for errors

**No data:**
- Ensure apps were used recently
- Check permission is granted
- Wait a few minutes for aggregation
- Verify Android version (5.1+)

**Build errors:**
- Ensure Kotlin is configured
- Check Gradle sync
- Verify React Native version compatibility

## Files Created/Modified

### New Files
- `modules/expo-screen-time/android/src/main/java/com/hydrosleep/tracker/screentime/ScreenTimeModule.kt`
- `modules/expo-screen-time/android/src/main/java/com/hydrosleep/tracker/screentime/ScreenTimePackage.kt`
- `modules/expo-screen-time/android/build.gradle`
- `modules/expo-screen-time/src/index.ts`
- `modules/expo-screen-time/README.md`
- `services/screenTimeService.ts`
- `screens/ScreenTimeScreen.tsx`
- `navigation/ScreenTimeStackNavigator.tsx`
- `server/src/models/ScreenTime.js`
- `server/src/routes/screenTime.js`
- `app.plugin.js`

### Modified Files
- `app.json` (added permission and plugin)
- `server/src/index.js` (added route)
- `services/api.ts` (added API methods)
- `types/navigation.ts` (added ScreenTime types)
- `navigation/MainTabNavigator.tsx` (added ScreenTime tab)

## Next Steps

1. Run `npx expo prebuild --platform android`
2. Copy native module files to android project
3. Register package in MainApplication
4. Build and test on Android device
5. Enable Usage Access permission
6. Verify data collection and display

## Notes

- iOS implementation is NOT included (Android-only as requested)
- Requires development build (not Expo Go)
- Native code must be integrated manually after prebuild
- Permission must be manually enabled by user
- Data accuracy depends on UsageStatsManager limitations

