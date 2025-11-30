import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoalRowProps {
  label: string;
  value: number;
  unit: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  theme: any;
}

function GoalRow({ label, value, unit, icon, onPress, theme }: GoalRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const displayUnit =
    unit === "times/week" ? "x" : unit === "L/day" ? "L" : "h";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.goalRow,
        { backgroundColor: theme.cardBackground },
        animatedStyle,
      ]}
    >
      <View style={styles.goalRowLeft}>
        <View
          style={[
            styles.goalIconContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name={icon} size={20} color={theme.primary} />
        </View>
        <ThemedText type="body">{label}</ThemedText>
      </View>
      <View style={styles.goalRowRight}>
        <ThemedText type="h4" style={{ color: theme.primary }}>
          {value}
          {displayUnit}
        </ThemedText>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const GOAL_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  exercise: { label: "Exercise Regularly", icon: "activity" },
  water: { label: "Drink Water", icon: "droplet" },
  sleep: { label: "Improve Sleep", icon: "moon" },
};

export default function GoalsScreen() {
  const { theme } = useTheme();
  const { goals, updateGoal } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<{
    type: "exercise" | "water" | "sleep";
    value: string;
  } | null>(null);

  const handleOpenEdit = (type: "exercise" | "water" | "sleep") => {
    const goal = goals.find((g) => g.type === type);
    if (goal) {
      setEditingGoal({ type, value: goal.value.toString() });
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (editingGoal) {
      const value = parseInt(editingGoal.value) || 0;
      if (value > 0) {
        updateGoal(editingGoal.type, value);
      }
      setModalVisible(false);
      setEditingGoal(null);
    }
  };

  const getEditLabel = () => {
    if (!editingGoal) return "";
    return GOAL_CONFIG[editingGoal.type]?.label || "";
  };

  const getEditUnit = () => {
    if (!editingGoal) return "";
    const goal = goals.find((g) => g.type === editingGoal.type);
    return goal?.unit || "";
  };

  return (
    <ScreenScrollView>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Daily
      </ThemedText>

      <View style={styles.goalsContainer}>
        {goals.map((goal) => {
          const config = GOAL_CONFIG[goal.type];
          return (
            <GoalRow
              key={goal.type}
              label={config?.label || goal.type}
              value={goal.value}
              unit={goal.unit}
              icon={config?.icon || "target"}
              onPress={() =>
                handleOpenEdit(goal.type as "exercise" | "water" | "sleep")
              }
              theme={theme}
            />
          );
        })}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Edit Goal</ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="body" style={styles.editLabel}>
              {getEditLabel()}
            </ThemedText>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.valueInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={editingGoal?.value || ""}
                onChangeText={(text) =>
                  setEditingGoal((prev) =>
                    prev ? { ...prev, value: text } : null
                  )
                }
                keyboardType="number-pad"
                maxLength={2}
              />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {getEditUnit()}
              </ThemedText>
            </View>

            <Button onPress={handleSave}>Save</Button>
          </ThemedView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  goalsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  goalRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
  editLabel: {
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  valueInput: {
    width: 80,
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
});
