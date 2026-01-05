package com.hydrosleep.tracker.screentime

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.text.SimpleDateFormat
import java.util.*

/**
 * Native Android module for screen time tracking using UsageStatsManager.
 * 
 * This module uses UsageStatsManager to collect app usage statistics.
 * 
 * Important Notes:
 * - Requires PACKAGE_USAGE_STATS permission (special permission, requires user to enable in Settings)
 * - Only tracks FOREGROUND app usage (apps visible to user)
 * - UsageStatsManager has limitations:
 *   - Data may not be available for very recent time periods
 *   - Aggregation intervals may affect accuracy
 *   - Some system apps may not appear in usage stats
 */
@RequiresApi(Build.VERSION_CODES.LOLLIPOP_MR1)
class ScreenTimeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  
  override fun getName(): String {
    return "ScreenTimeModule"
  }

  /**
   * Check if Usage Access permission is granted.
   * @return true if permission is granted, false otherwise
   */
  @ReactMethod
  fun isUsageAccessGranted(promise: Promise) {
    try {
      val context = reactApplicationContext
      val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val currentTime = System.currentTimeMillis()
      
      // Try to query usage stats for the last minute
      // If permission is not granted, this will return empty list
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        currentTime - 60000, // Last minute
        currentTime
      )
      
      // Permission is granted if we can query (even if empty)
      // But we also need to check if the app has the permission in Settings
      val packageName = context.packageName
      val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOpsManager.unsafeCheckOpNoThrow(
          android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          packageName
        )
      } else {
        @Suppress("DEPRECATION")
        appOpsManager.checkOpNoThrow(
          android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
          android.os.Process.myUid(),
          packageName
        )
      }
      
      val isGranted = mode == android.app.AppOpsManager.MODE_ALLOWED
      promise.resolve(isGranted)
    } catch (e: Exception) {
      promise.reject("PERMISSION_CHECK_ERROR", "Error checking usage access permission: ${e.message}", e)
    }
  }

  /**
   * Open Usage Access Settings screen for the user.
   */
  @ReactMethod
  fun openUsageAccessSettings(promise: Promise) {
    try {
      val context = reactApplicationContext
      val intent = Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      
      if (intent.resolveActivity(context.packageManager) != null) {
        context.startActivity(intent)
        promise.resolve(true)
      } else {
        promise.reject("SETTINGS_UNAVAILABLE", "Usage Access Settings screen is not available on this device")
      }
    } catch (e: Exception) {
      promise.reject("OPEN_SETTINGS_ERROR", "Error opening Usage Access Settings: ${e.message}", e)
    }
  }

  /**
   * Get screen time data for the specified number of days.
   * Aggregates app usage per day, per app.
   * 
   * @param rangeInDays Number of days to fetch (1, 7, or 10)
   * @return Promise resolving to array of ScreenTimeEntry objects
   */
  @ReactMethod
  fun getScreenTimeData(rangeInDays: Int, promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP_MR1) {
        promise.reject("UNSUPPORTED_VERSION", "UsageStatsManager requires Android 5.1 (API 22) or higher")
        return
      }

      val context = reactApplicationContext
      val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val packageManager = context.packageManager

      // Validate range
      if (rangeInDays !in listOf(1, 7, 10)) {
        promise.reject("INVALID_RANGE", "Range must be 1, 7, or 10 days")
        return
      }

      // Calculate time range
      val endTime = System.currentTimeMillis()
      val startTime = endTime - (rangeInDays * 24 * 60 * 60 * 1000L)

      // Use UsageEvents for more accurate per-app, per-day tracking
      val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
      
      // Map to store aggregated usage: date -> packageName -> totalMs
      val usageMap = mutableMapOf<String, MutableMap<String, Long>>()
      // Map to store app names: packageName -> appName
      val appNameMap = mutableMapOf<String, String>()

      val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
      dateFormat.timeZone = TimeZone.getDefault()

      // Track the last known foreground app for each time segment
      var lastEventTime = startTime
      var lastPackageName: String? = null

      while (usageEvents.hasNextEvent()) {
        val event = UsageEvents.Event()
        usageEvents.getNextEvent(event)

        when (event.eventType) {
          UsageEvents.Event.MOVE_TO_FOREGROUND -> {
            // If there was a previous app in foreground, calculate its usage
            if (lastPackageName != null && lastEventTime > 0) {
              val usageMs = event.timeStamp - lastEventTime
              if (usageMs > 0) {
                val date = dateFormat.format(Date(lastEventTime))
                usageMap.getOrPut(date) { mutableMapOf() }
                usageMap[date]!![lastPackageName!!] = usageMap[date]!!.getOrDefault(lastPackageName!!, 0L) + usageMs
                
                // Cache app name
                if (!appNameMap.containsKey(lastPackageName!!)) {
                  appNameMap[lastPackageName!!] = getAppName(packageManager, lastPackageName!!)
                }
              }
            }
            lastPackageName = event.packageName
            lastEventTime = event.timeStamp
          }
          UsageEvents.Event.MOVE_TO_BACKGROUND -> {
            // Calculate usage for the app going to background
            if (lastPackageName != null && lastEventTime > 0) {
              val usageMs = event.timeStamp - lastEventTime
              if (usageMs > 0) {
                val date = dateFormat.format(Date(lastEventTime))
                usageMap.getOrPut(date) { mutableMapOf() }
                usageMap[date]!![lastPackageName!!] = usageMap[date]!!.getOrDefault(lastPackageName!!, 0L) + usageMs
                
                // Cache app name
                if (!appNameMap.containsKey(lastPackageName!!)) {
                  appNameMap[lastPackageName!!] = getAppName(packageManager, lastPackageName!!)
                }
              }
            }
            lastPackageName = null
            lastEventTime = event.timeStamp
          }
        }
      }

      // Handle case where an app is still in foreground at endTime
      if (lastPackageName != null && lastEventTime > 0) {
        val usageMs = endTime - lastEventTime
        if (usageMs > 0) {
          val date = dateFormat.format(Date(lastEventTime))
          usageMap.getOrPut(date) { mutableMapOf() }
          usageMap[date]!![lastPackageName!!] = usageMap[date]!!.getOrDefault(lastPackageName!!, 0L) + usageMs
          
          if (!appNameMap.containsKey(lastPackageName!!)) {
            appNameMap[lastPackageName!!] = getAppName(packageManager, lastPackageName!!)
          }
        }
      }

      // Convert to WritableArray format
      val result = WritableNativeArray()
      
      usageMap.forEach { (date, packageUsageMap) ->
        packageUsageMap.forEach { (packageName, usageMs) ->
          val entry = WritableNativeMap()
          entry.putString("packageName", packageName)
          entry.putString("appName", appNameMap[packageName] ?: packageName)
          entry.putDouble("usageMs", usageMs.toDouble())
          entry.putString("date", date)
          result.pushMap(entry)
        }
      }

      promise.resolve(result)
    } catch (e: SecurityException) {
      promise.reject("PERMISSION_DENIED", "Usage Access permission not granted. Please enable it in Settings.", e)
    } catch (e: Exception) {
      promise.reject("FETCH_ERROR", "Error fetching screen time data: ${e.message}", e)
    }
  }

  /**
   * Get human-readable app name from package name.
   */
  private fun getAppName(packageManager: PackageManager, packageName: String): String {
    return try {
      val applicationInfo: ApplicationInfo = packageManager.getApplicationInfo(packageName, 0)
      val appName = packageManager.getApplicationLabel(applicationInfo).toString()
      appName.ifEmpty { packageName }
    } catch (e: PackageManager.NameNotFoundException) {
      packageName
    } catch (e: Exception) {
      packageName
    }
  }
}

