import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

const { ScreenTimeModule } = NativeModules;

export interface ScreenTimeEntry {
  packageName: string;
  appName: string;
  usageMs: number;
  date: string; // YYYY-MM-DD format
}

/**
 * Check if running in Expo Go (which doesn't support custom native modules)
 */
function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

/**
 * Check if native module is available
 */
function isModuleAvailable(): boolean {
  return ScreenTimeModule != null;
}

class ScreenTimeNativeModule {
  /**
   * Check if Usage Access permission is granted.
   * @returns Promise resolving to true if permission is granted, false otherwise
   */
  async isUsageAccessGranted(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      throw new Error('Screen time tracking is only available on Android');
    }
    if (isExpoGo()) {
      throw new Error(
        'Screen time tracking requires a development build. Expo Go does not support custom native modules. ' +
        'Please build the app using: npx expo run:android (after running npx expo prebuild)'
      );
    }
    if (!isModuleAvailable()) {
      throw new Error(
        'ScreenTimeModule is not available. ' +
        'Make sure you have run "npx expo prebuild" and integrated the native code. ' +
        'See modules/expo-screen-time/README.md for setup instructions.'
      );
    }
    return ScreenTimeModule.isUsageAccessGranted();
  }

  /**
   * Open Usage Access Settings screen.
   * @returns Promise resolving to true if settings were opened successfully
   */
  async openUsageAccessSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      throw new Error('Screen time tracking is only available on Android');
    }
    if (isExpoGo()) {
      throw new Error(
        'Screen time tracking requires a development build. Expo Go does not support custom native modules.'
      );
    }
    if (!isModuleAvailable()) {
      throw new Error(
        'ScreenTimeModule is not available. Make sure native code is properly linked.'
      );
    }
    return ScreenTimeModule.openUsageAccessSettings();
  }

  /**
   * Get screen time data for the specified number of days.
   * Aggregates usage per day, per app.
   * 
   * @param rangeInDays Number of days to fetch (1, 7, or 10)
   * @returns Promise resolving to array of ScreenTimeEntry objects
   */
  async getScreenTimeData(rangeInDays: 1 | 7 | 10): Promise<ScreenTimeEntry[]> {
    if (Platform.OS !== 'android') {
      throw new Error('Screen time tracking is only available on Android');
    }
    if (isExpoGo()) {
      throw new Error(
        'Screen time tracking requires a development build. Expo Go does not support custom native modules.'
      );
    }
    if (!isModuleAvailable()) {
      throw new Error(
        'ScreenTimeModule is not available. Make sure native code is properly linked.'
      );
    }
    if (![1, 7, 10].includes(rangeInDays)) {
      throw new Error('Range must be 1, 7, or 10 days');
    }
    return ScreenTimeModule.getScreenTimeData(rangeInDays);
  }
}

export default new ScreenTimeNativeModule();

