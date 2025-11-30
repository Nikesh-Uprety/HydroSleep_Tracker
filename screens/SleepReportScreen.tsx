import React, { useState } from "react";
import { View, StyleSheet, Modal, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

function StatCircle({
  value,
  label,
  theme,
}: {
  value: string;
  label: string;
  theme: any;
}) {
  return (
    <View style={styles.statCircle}>
      <View
        style={[
          styles.statCircleInner,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <ThemedText
          type="body"
          style={[styles.statValue, { color: theme.primary }]}
        >
          {value}
        </ThemedText>
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function SleepReportScreen() {
  const { theme } = useTheme();
  const { getLatestSleep, addSleepEntry } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const latestSleep = getLatestSleep();

  const sleepHours = latestSleep
    ? Math.floor(latestSleep.durationMinutes / 60)
    : 0;
  const sleepMins = latestSleep ? latestSleep.durationMinutes % 60 : 0;

  const handleLogSleep = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;

    if (totalMinutes > 0) {
      addSleepEntry({
        date: new Date(),
        durationMinutes: totalMinutes,
        restedPercent: Math.floor(Math.random() * 20) + 75,
        remPercent: Math.floor(Math.random() * 15) + 20,
        deepSleepPercent: Math.floor(Math.random() * 10) + 15,
      });
      setModalVisible(false);
      setHours("");
      setMinutes("");
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.simpleCard}>
        <View style={styles.illustrationContainer}>
          <Image
            source={require("@/assets/images/illustrations/person_sleeping_peacefully_illustration.png")}
            style={styles.sleepIllustration}
            contentFit="contain"
          />
        </View>

        <ThemedText type="h1" style={styles.timeDisplay}>
          {sleepHours}h {sleepMins.toString().padStart(2, "0")}m
        </ThemedText>

        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {latestSleep ? "Didn't move in bed" : "No sleep data recorded"}
        </ThemedText>

        <Button
          onPress={() => setModalVisible(true)}
          style={styles.trackButton}
        >
          Log Sleep
        </Button>
      </View>

      {latestSleep ? (
        <View
          style={[
            styles.detailCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.achievementHeader}>
            <Image
              source={require("@/assets/images/illustrations/gold_medal_achievement_badge.png")}
              style={styles.medalIcon}
              contentFit="contain"
            />
            <ThemedText type="h4" style={{ color: theme.primary }}>
              Great Job!
            </ThemedText>
            <ThemedText type="h3">
              {sleepHours}h {sleepMins.toString().padStart(2, "0")}m
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <StatCircle
              value={`${latestSleep.restedPercent}%`}
              label="Rested"
              theme={theme}
            />
            <StatCircle
              value={`${latestSleep.remPercent}%`}
              label="REM"
              theme={theme}
            />
            <StatCircle
              value={`${latestSleep.deepSleepPercent}%`}
              label="Deep Sleep"
              theme={theme}
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <ThemedText type="body" style={styles.suggestionsTitle}>
              Suggestions
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, lineHeight: 20 }}
            >
              A consistent sleep schedule helps your body recover. Try to go to
              bed and wake up at the same time every day.
            </ThemedText>
          </View>
        </View>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Log Sleep</ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={styles.modalSubtitle}>
              Enter your sleep duration
            </ThemedText>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: theme.backgroundDefault,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  value={hours}
                  onChangeText={setHours}
                  maxLength={2}
                />
                <ThemedText type="small">Hours</ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: theme.backgroundDefault,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={setMinutes}
                  maxLength={2}
                />
                <ThemedText type="small">Minutes</ThemedText>
              </View>
            </View>

            <Button onPress={handleLogSleep}>Save</Button>
          </ThemedView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  simpleCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  illustrationContainer: {
    marginBottom: Spacing.lg,
  },
  sleepIllustration: {
    width: 160,
    height: 160,
  },
  timeDisplay: {
    marginBottom: Spacing.xs,
  },
  trackButton: {
    marginTop: Spacing.xl,
    width: "100%",
  },
  detailCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  medalIcon: {
    width: 60,
    height: 60,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
  },
  statCircle: {
    alignItems: "center",
  },
  statCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontWeight: "700",
  },
  suggestionsContainer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  suggestionsTitle: {
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
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
  },
  timeInput: {
    width: "100%",
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
});
