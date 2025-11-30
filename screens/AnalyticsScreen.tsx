import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Rect, Line, Circle, Path, Text as SvgText } from "react-native-svg";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const CHART_WIDTH = Dimensions.get("window").width - Spacing.xl * 2 - Spacing.lg * 2;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 24;
const BAR_GAP = (CHART_WIDTH - BAR_WIDTH * 7) / 6;

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { getAnalyticsSummary } = useApp();
  const analytics = getAnalyticsSummary();

  const renderSleepChart = () => {
    const maxHours = Math.max(...analytics.sleep.hours, 10);
    const barHeightScale = (CHART_HEIGHT - 30) / maxHours;

    return (
      <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleRow}>
            <Feather name="moon" size={20} color={theme.primary} />
            <ThemedText type="body" style={styles.chartTitle}>
              Weekly Sleep
            </ThemedText>
          </View>
          <View style={[styles.avgBadge, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              Avg: {analytics.sleep.average.toFixed(1)}h
            </ThemedText>
          </View>
        </View>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {analytics.sleep.days.map((day, index) => {
            const hours = analytics.sleep.hours[index];
            const barHeight = hours * barHeightScale;
            const x = index * (BAR_WIDTH + BAR_GAP);
            const y = CHART_HEIGHT - 25 - barHeight;
            const isGoalMet = hours >= 8;

            return (
              <React.Fragment key={day}>
                <Rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={4}
                  fill={isGoalMet ? theme.success : theme.primary}
                  opacity={hours > 0 ? 1 : 0.2}
                />
                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT - 5}
                  fontSize={10}
                  fill={theme.textSecondary}
                  textAnchor="middle"
                >
                  {day}
                </SvgText>
                {hours > 0 ? (
                  <SvgText
                    x={x + BAR_WIDTH / 2}
                    y={y - 5}
                    fontSize={9}
                    fill={theme.text}
                    textAnchor="middle"
                  >
                    {hours.toFixed(1)}
                  </SvgText>
                ) : null}
              </React.Fragment>
            );
          })}
        </Svg>

        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          Hours of sleep per day. Green bars indicate 8+ hours.
        </ThemedText>
      </View>
    );
  };

  const renderWaterChart = () => {
    const maxLiters = Math.max(...analytics.water.liters, analytics.water.dailyGoalLiters + 1);
    const barHeightScale = (CHART_HEIGHT - 30) / maxLiters;
    const goalLineY = CHART_HEIGHT - 25 - analytics.water.dailyGoalLiters * barHeightScale;

    return (
      <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleRow}>
            <Feather name="droplet" size={20} color={theme.primary} />
            <ThemedText type="body" style={styles.chartTitle}>
              Weekly Water Intake
            </ThemedText>
          </View>
          <View style={[styles.avgBadge, { backgroundColor: theme.successLight }]}>
            <ThemedText type="small" style={{ color: theme.success }}>
              {analytics.water.goalMetCount}/7 days
            </ThemedText>
          </View>
        </View>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Line
            x1={0}
            y1={goalLineY}
            x2={CHART_WIDTH}
            y2={goalLineY}
            stroke={theme.success}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          
          {analytics.water.days.map((day, index) => {
            const liters = analytics.water.liters[index];
            const barHeight = liters * barHeightScale;
            const x = index * (BAR_WIDTH + BAR_GAP);
            const y = CHART_HEIGHT - 25 - barHeight;
            const isGoalMet = liters >= analytics.water.dailyGoalLiters;

            return (
              <React.Fragment key={day}>
                <Rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={4}
                  fill={isGoalMet ? theme.success : theme.primary}
                  opacity={liters > 0 ? 1 : 0.2}
                />
                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT - 5}
                  fontSize={10}
                  fill={theme.textSecondary}
                  textAnchor="middle"
                >
                  {day}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          Daily water intake in liters. Goal: {analytics.water.dailyGoalLiters}L
        </ThemedText>
      </View>
    );
  };

  const renderGoalProgress = () => {
    const progress = analytics.goals.weeklyCompletionRatePercent;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleRow}>
            <Feather name="target" size={20} color={theme.primary} />
            <ThemedText type="body" style={styles.chartTitle}>
              Goal Progress
            </ThemedText>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Svg width={120} height={120}>
            <Circle
              cx={60}
              cy={60}
              r={40}
              stroke={theme.backgroundTertiary}
              strokeWidth={10}
              fill="transparent"
            />
            <Circle
              cx={60}
              cy={60}
              r={40}
              stroke={theme.primary}
              strokeWidth={10}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {progress}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h4" style={{ color: theme.primary }}>
              {analytics.goals.totalGoals}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Goals
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h4" style={{ color: theme.success }}>
              {analytics.goals.completedToday}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Done Today
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          Your weekly goal completion rate based on sleep and water targets.
        </ThemedText>
      </View>
    );
  };

  return (
    <ScreenScrollView>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
        Your weekly health insights
      </ThemedText>

      {renderSleepChart()}
      {renderWaterChart()}
      {renderGoalProgress()}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  chartTitle: {
    fontWeight: "600",
  },
  avgBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: Spacing.lg,
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
});
