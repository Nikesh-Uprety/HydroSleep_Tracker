import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { screenTimeService, ScreenTimeEntry, ScreenTimeError } from "@/services/screenTimeService";
import { api } from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const CHART_WIDTH = Dimensions.get("window").width - Spacing.xl * 2 - Spacing.lg * 2;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 28;
const MAX_DAYS = 10;

interface DailyTotal {
  date: string;
  totalMs: number;
}

export default function ScreenTimeScreen() {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeEntry[]>([]);
  const [selectedRange, setSelectedRange] = useState<1 | 7 | 10>(7);
  const [error, setError] = useState<string | null>(null);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Fetch data when permission is granted or range changes
  useEffect(() => {
    if (hasPermission === true) {
      fetchScreenTimeData();
    }
  }, [hasPermission, selectedRange]);

  const checkPermission = async () => {
    try {
      const granted = await screenTimeService.checkPermission();
      setHasPermission(granted);
      setError(null);
    } catch (err: any) {
      console.error("Error checking permission:", err);
      setHasPermission(false);
      // Set error message for display
      setError(err.message || "Failed to check permission");
    }
  };

  const handleOpenSettings = async () => {
    try {
      const opened = await screenTimeService.openPermissionSettings();
      if (opened) {
        // Wait a bit, then check permission again
        setTimeout(() => {
          checkPermission();
        }, 1000);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to open settings");
    }
  };

  const fetchScreenTimeData = async (forceRefresh: boolean = false) => {
    if (Platform.OS !== "android") {
      setError("Screen time tracking is only available on Android");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await screenTimeService.getScreenTimeData(selectedRange, forceRefresh);
      setScreenTimeData(data);

      // Sync to backend
      if (data.length > 0) {
        try {
          await api.syncScreenTime(data);
        } catch (syncError) {
          console.error("Failed to sync screen time to backend:", syncError);
          // Don't show error to user, just log it
        }
      }
    } catch (err: any) {
      console.error("Error fetching screen time:", err);
      const error = err as ScreenTimeError;
      
      if (error.code === "PERMISSION_DENIED") {
        setHasPermission(false);
        setError("Usage Access permission is required to track screen time");
      } else {
        setError(error.message || "Failed to fetch screen time data");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchScreenTimeData(true);
  }, [selectedRange]);

  // Calculate daily totals
  const getDailyTotals = (): DailyTotal[] => {
    const totals: Record<string, number> = {};
    
    screenTimeData.forEach((entry) => {
      if (!totals[entry.date]) {
        totals[entry.date] = 0;
      }
      totals[entry.date] += entry.usageMs;
    });

    return Object.entries(totals)
      .map(([date, totalMs]) => ({ date, totalMs }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-MAX_DAYS); // Last 10 days
  };

  // Get today's total
  const getTodayTotal = (): number => {
    const today = new Date().toISOString().split("T")[0];
    return screenTimeData
      .filter((entry) => entry.date === today)
      .reduce((total, entry) => total + entry.usageMs, 0);
  };

  // Get app breakdown (sorted by usage)
  const getAppBreakdown = (): Array<{ packageName: string; appName: string; totalMs: number }> => {
    const breakdown: Record<string, { packageName: string; appName: string; totalMs: number }> = {};
    
    screenTimeData.forEach((entry) => {
      if (!breakdown[entry.packageName]) {
        breakdown[entry.packageName] = {
          packageName: entry.packageName,
          appName: entry.appName,
          totalMs: 0,
        };
      }
      breakdown[entry.packageName].totalMs += entry.usageMs;
    });

    return Object.values(breakdown)
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 20); // Top 20 apps
  };

  const renderPermissionScreen = () => {
    // Check if error is about native module not available
    const isModuleError = error?.includes('ScreenTimeModule is not available') || 
                         error?.includes('development build') ||
                         error?.includes('Expo Go');

    if (isModuleError) {
      return (
        <ScreenScrollView>
          <View style={styles.permissionContainer}>
            <View style={[styles.permissionIconContainer, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="settings" size={48} color={theme.warning} />
            </View>

            <ThemedText type="h2" style={styles.permissionTitle}>
              Development Build Required
            </ThemedText>

            <ThemedText type="body" style={[styles.permissionText, { color: theme.textSecondary }]}>
              Screen time tracking requires a development build with native code integration. 
              Expo Go does not support custom native modules.
            </ThemedText>

            <Card style={styles.setupCard}>
              <ThemedText type="body" style={[styles.setupTitle, { fontWeight: "600", marginBottom: Spacing.md }]}>
                Setup Instructions:
              </ThemedText>
              <View style={styles.setupSteps}>
                <ThemedText type="small" style={[styles.setupStep, { color: theme.textSecondary }]}>
                  1. Run: <ThemedText style={{ fontFamily: 'monospace' }}>npx expo prebuild --platform android</ThemedText>
                </ThemedText>
                <ThemedText type="small" style={[styles.setupStep, { color: theme.textSecondary }]}>
                  2. Copy native module files to android project
                </ThemedText>
                <ThemedText type="small" style={[styles.setupStep, { color: theme.textSecondary }]}>
                  3. Register package in MainApplication.java
                </ThemedText>
                <ThemedText type="small" style={[styles.setupStep, { color: theme.textSecondary }]}>
                  4. Run: <ThemedText style={{ fontFamily: 'monospace' }}>npx expo run:android</ThemedText>
                </ThemedText>
              </View>
              <ThemedText type="small" style={[styles.setupHint, { color: theme.textSecondary, marginTop: Spacing.md }]}>
                See modules/expo-screen-time/README.md for detailed instructions.
              </ThemedText>
            </Card>
          </View>
        </ScreenScrollView>
      );
    }

    return (
      <ScreenScrollView>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIconContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="shield" size={48} color={theme.primary} />
          </View>

          <ThemedText type="h2" style={styles.permissionTitle}>
            Enable Screen Time Tracking
          </ThemedText>

          <ThemedText type="body" style={[styles.permissionText, { color: theme.textSecondary }]}>
            To track your screen time, we need access to your app usage statistics. This data helps you
            understand how much time you spend on different apps.
          </ThemedText>

          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.infoRow}>
              <Feather name="lock" size={20} color={theme.primary} />
              <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
                Your data stays on your device and is only synced to your account
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Feather name="bar-chart-2" size={20} color={theme.primary} />
              <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
                We only track foreground app usage (apps you're actively using)
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Feather name="settings" size={20} color={theme.primary} />
              <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
                You can revoke this permission anytime in Settings
              </ThemedText>
            </View>
          </View>

          <Button onPress={handleOpenSettings} style={styles.permissionButton}>
            Open Usage Access Settings
          </Button>

          <ThemedText type="small" style={[styles.permissionHint, { color: theme.textSecondary }]}>
            After enabling, return to this screen to see your screen time data
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  };

  const renderDailyChart = () => {
    const dailyTotals = getDailyTotals();
    
    if (dailyTotals.length === 0) {
      return (
        <Card style={styles.chartCard}>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No data available for the selected range
          </ThemedText>
        </Card>
      );
    }

    const maxMs = Math.max(...dailyTotals.map((d) => d.totalMs), 1);
    const barHeightScale = (CHART_HEIGHT - 40) / maxMs;
    const barGap = (CHART_WIDTH - BAR_WIDTH * dailyTotals.length) / (dailyTotals.length + 1);
    const today = new Date().toISOString().split("T")[0];

    return (
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            Daily Screen Time
          </ThemedText>
        </View>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {dailyTotals.map((day, index) => {
            const barHeight = (day.totalMs / maxMs) * (CHART_HEIGHT - 40);
            const x = barGap + index * (BAR_WIDTH + barGap);
            const y = CHART_HEIGHT - 30 - barHeight;
            const isToday = day.date === today;
            const hours = screenTimeService.formatHours(day.totalMs);

            return (
              <React.Fragment key={day.date}>
                <Rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={4}
                  fill={isToday ? theme.primary : theme.primaryLight}
                  opacity={day.totalMs > 0 ? 1 : 0.3}
                />
                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT - 8}
                  fontSize={10}
                  fill={isToday ? theme.primary : theme.textSecondary}
                  textAnchor="middle"
                  fontWeight={isToday ? "600" : "400"}
                >
                  {new Date(day.date).getDate()}
                </SvgText>
                {day.totalMs > 0 && (
                  <SvgText
                    x={x + BAR_WIDTH / 2}
                    y={y - 5}
                    fontSize={9}
                    fill={theme.text}
                    textAnchor="middle"
                  >
                    {hours.toFixed(1)}h
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </Card>
    );
  };

  const renderAppBreakdown = () => {
    const appBreakdown = getAppBreakdown();

    if (appBreakdown.length === 0) {
      return (
        <Card>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No app usage data available
          </ThemedText>
        </Card>
      );
    }

    return (
      <Card>
        <ThemedText type="body" style={[styles.sectionTitle, { fontWeight: "600" }]}>
          Top Apps
        </ThemedText>
        {appBreakdown.map((app, index) => (
          <View key={app.packageName} style={styles.appRow}>
            <View style={styles.appInfo}>
              <View style={[styles.appRank, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600" }}>
                  {index + 1}
                </ThemedText>
              </View>
              <View style={styles.appDetails}>
                <ThemedText type="body" style={{ fontWeight: "500" }}>
                  {app.appName}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {screenTimeService.formatDuration(app.totalMs)}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </Card>
    );
  };

  // Show permission screen if permission not granted OR module not available
  if (hasPermission === false) {
    return renderPermissionScreen();
  }

  // Show loading state while checking permission
  if (hasPermission === null) {
    return (
      <ScreenScrollView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenScrollView>
    );
  }

  const todayTotal = getTodayTotal();

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    >
      {/* Range Selector */}
      <View style={styles.rangeSelector}>
        {([1, 7, 10] as const).map((range) => (
          <Button
            key={range}
            onPress={() => setSelectedRange(range)}
            style={[
              styles.rangeButton,
              selectedRange === range && { backgroundColor: theme.primary },
            ]}
            textStyle={selectedRange === range ? { color: "#FFFFFF" } : undefined}
          >
            {range === 1 ? "24h" : `${range}d`}
          </Button>
        ))}
      </View>

      {/* Today's Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Feather name="smartphone" size={24} color={theme.primary} />
          <View style={styles.summaryContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Today's Screen Time
            </ThemedText>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {screenTimeService.formatDuration(todayTotal)}
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* Error State */}
      {error && (
        <Card style={[styles.errorCard, { backgroundColor: theme.error + "15" }]}>
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !isRefreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText type="small" style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading screen time data...
          </ThemedText>
        </View>
      )}

      {/* Charts and Breakdown */}
      {!isLoading && !error && (
        <>
          {renderDailyChart()}
          {renderAppBreakdown()}
        </>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  permissionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  permissionButton: {
    marginBottom: Spacing.md,
  },
  permissionHint: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    fontSize: 12,
  },
  rangeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  summaryContent: {
    flex: 1,
  },
  chartCard: {
    marginBottom: Spacing.lg,
  },
  chartHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  appRow: {
    marginBottom: Spacing.md,
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  appRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  appDetails: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing["4xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  errorCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  setupCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  setupTitle: {
    marginBottom: Spacing.md,
  },
  setupSteps: {
    gap: Spacing.sm,
  },
  setupStep: {
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  setupHint: {
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});

