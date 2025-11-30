import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WaterBar({
  amount,
  goal,
  day,
  isToday,
  theme,
}: {
  amount: number;
  goal: number;
  day: string;
  isToday: boolean;
  theme: any;
}) {
  const percentage = Math.min((amount / goal) * 100, 100);
  const maxHeight = 120;
  const height = (percentage / 100) * maxHeight;

  return (
    <View style={styles.barContainer}>
      <View
        style={[
          styles.barBackground,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              height,
              backgroundColor: percentage >= 100 ? theme.success : theme.primary,
            },
          ]}
        />
      </View>
      <ThemedText
        type="small"
        style={[
          styles.barLabel,
          { color: isToday ? theme.primary : theme.textSecondary },
          isToday && { fontWeight: "600" },
        ]}
      >
        {day}
      </ThemedText>
    </View>
  );
}

export default function WaterReportScreen() {
  const { theme } = useTheme();
  const { getWeeklyWater, isWeeklyGoalMet, addWaterLog, goals, getTodayWater } =
    useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const weeklyData = getWeeklyWater();
  const goalMet = isWeeklyGoalMet();
  const waterGoal = goals.find((g) => g.type === "water");
  const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;
  const todayWater = getTodayWater();

  const startOfWeek = weeklyData[0]?.date;
  const weekLabel = startOfWeek
    ? `Week of ${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "This Week";

  const today = new Date().getDay();

  const handleQuickAdd = (amount: number) => {
    addWaterLog(amount);
    setModalVisible(false);
  };

  return (
    <ScreenScrollView>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {weekLabel}
      </ThemedText>

      <View
        style={[
          styles.bannerContainer,
          {
            backgroundColor: goalMet ? theme.successLight : theme.backgroundDefault,
          },
        ]}
      >
        <Feather
          name={goalMet ? "award" : "trending-up"}
          size={20}
          color={goalMet ? theme.success : theme.primary}
        />
        <ThemedText
          type="body"
          style={[
            styles.bannerText,
            { color: goalMet ? theme.success : theme.primary },
          ]}
        >
          {goalMet ? "7 Day Goal Met!" : "Keep Going!"}
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        {weeklyData.map((day, index) => (
          <WaterBar
            key={index}
            amount={day.amountMl}
            goal={dailyGoalMl}
            day={DAYS[index]}
            isToday={index === today}
            theme={theme}
          />
        ))}
      </View>

      <View style={styles.todayProgress}>
        <ThemedText type="body" style={styles.todayLabel}>
          Today's Progress
        </ThemedText>
        <ThemedText type="h3" style={{ color: theme.primary }}>
          {(todayWater / 1000).toFixed(1)}L / {waterGoal?.value || 3}L
        </ThemedText>
      </View>

      <Button onPress={() => setModalVisible(true)} style={styles.addButton}>
        Add Water
      </Button>

      <View
        style={[styles.tipsCard, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedText type="body" style={styles.tipsTitle}>
          Tips
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, lineHeight: 20 }}
        >
          The more you drink regularly, the better your hydration. Try to spread
          your water intake throughout the day rather than drinking large amounts
          at once.
        </ThemedText>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Add Water</ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.quickAddGrid}>
              {[250, 500, 750, 1000].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => handleQuickAdd(amount)}
                  style={({ pressed }) => [
                    styles.quickAddButton,
                    { backgroundColor: theme.backgroundDefault },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Feather name="droplet" size={20} color={theme.primary} />
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {amount}ml
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  bannerText: {
    fontWeight: "600",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barBackground: {
    width: 32,
    height: 120,
    borderRadius: BorderRadius.xs,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: BorderRadius.xs,
  },
  barLabel: {
    marginTop: Spacing.xs,
  },
  todayProgress: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  todayLabel: {
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  tipsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickAddButton: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.xs,
  },
});
