import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenTimeModule, { ScreenTimeEntry } from '../modules/expo-screen-time/src';

const CACHE_KEY_PREFIX = 'screenTimeData_';
const CACHE_DATE_KEY = 'screenTimeLastFetchDate';

export interface ScreenTimeError {
  code: string;
  message: string;
}

/**
 * Service layer for screen time tracking.
 * Handles data fetching, caching, and error management.
 */
class ScreenTimeService {
  /**
   * Check if Usage Access permission is granted.
   */
  async checkPermission(): Promise<boolean> {
    try {
      return await ScreenTimeModule.isUsageAccessGranted();
    } catch (error: any) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Open Usage Access Settings screen.
   */
  async openPermissionSettings(): Promise<boolean> {
    try {
      return await ScreenTimeModule.openUsageAccessSettings();
    } catch (error: any) {
      console.error('Error opening settings:', error);
      throw {
        code: 'SETTINGS_ERROR',
        message: error.message || 'Failed to open Usage Access Settings',
      } as ScreenTimeError;
    }
  }

  /**
   * Get cached data for a specific range.
   */
  private async getCachedData(rangeInDays: 1 | 7 | 10): Promise<ScreenTimeEntry[] | null> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${rangeInDays}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const lastFetchDate = await AsyncStorage.getItem(CACHE_DATE_KEY);

      if (!cachedData || !lastFetchDate) {
        return null;
      }

      // Check if cache is still valid (same day)
      const today = new Date().toISOString().split('T')[0];
      if (lastFetchDate !== today) {
        return null; // Cache expired
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache data for a specific range.
   */
  private async setCachedData(rangeInDays: 1 | 7 | 10, data: ScreenTimeEntry[]): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${rangeInDays}`;
      const today = new Date().toISOString().split('T')[0];
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_DATE_KEY, today);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Clear all cached screen time data.
   */
  async clearCache(): Promise<void> {
    try {
      const ranges: (1 | 7 | 10)[] = [1, 7, 10];
      const keys = ranges.map(range => `${CACHE_KEY_PREFIX}${range}`);
      keys.push(CACHE_DATE_KEY);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get screen time data for the specified range.
   * Uses cache if available and valid, otherwise fetches from native module.
   * 
   * @param rangeInDays Number of days to fetch (1, 7, or 10)
   * @param forceRefresh If true, bypass cache and fetch fresh data
   * @returns Promise resolving to array of ScreenTimeEntry objects
   */
  async getScreenTimeData(
    rangeInDays: 1 | 7 | 10,
    forceRefresh: boolean = false
  ): Promise<ScreenTimeEntry[]> {
    // Check permission first
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      throw {
        code: 'PERMISSION_DENIED',
        message: 'Usage Access permission not granted. Please enable it in Settings.',
      } as ScreenTimeError;
    }

    // Try cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(rangeInDays);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Fetch fresh data from native module
    try {
      const data = await ScreenTimeModule.getScreenTimeData(rangeInDays);
      
      // Cache the data
      await this.setCachedData(rangeInDays, data);
      
      return data;
    } catch (error: any) {
      console.error('Error fetching screen time data:', error);
      
      // Handle specific error codes
      if (error.code === 'PERMISSION_DENIED') {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'Usage Access permission not granted. Please enable it in Settings.',
        } as ScreenTimeError;
      }

      if (error.code === 'PERMISSION_CHECK_ERROR') {
        throw {
          code: 'PERMISSION_ERROR',
          message: 'Error checking permission. Please try again.',
        } as ScreenTimeError;
      }

      throw {
        code: 'FETCH_ERROR',
        message: error.message || 'Failed to fetch screen time data',
      } as ScreenTimeError;
    }
  }

  /**
   * Get total screen time for today (in milliseconds).
   */
  async getTodayTotalScreenTime(): Promise<number> {
    try {
      const data = await this.getScreenTimeData(1);
      const today = new Date().toISOString().split('T')[0];
      
      return data
        .filter(entry => entry.date === today)
        .reduce((total, entry) => total + entry.usageMs, 0);
    } catch (error) {
      console.error('Error getting today total:', error);
      return 0;
    }
  }

  /**
   * Format milliseconds to human-readable string (e.g., "2h 30m").
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format milliseconds to hours (decimal, e.g., 2.5 for 2h 30m).
   */
  formatHours(ms: number): number {
    return ms / (1000 * 60 * 60);
  }
}

export const screenTimeService = new ScreenTimeService();
export default screenTimeService;

