import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, TextInput, Alert } from "react-native";
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
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: keyof typeof Feather.glyphMap;
  isDefault: boolean;
  onPress: () => void;
  onDelete?: () => void;
  theme: any;
}

function GoalRow({ id, label, value, unit, icon, isDefault, onPress, onDelete, theme }: GoalRowProps) {
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

  const getDisplayUnit = () => {
    if (unit === "times/week") return "x";
    if (unit === "L/day") return "L";
    if (unit === "hours/night") return "h";
    return unit;
  };

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
        <View style={styles.goalTextContainer}>
          <ThemedText type="body">{label}</ThemedText>
          {!isDefault ? (
            <View style={[styles.customBadge, { backgroundColor: theme.primaryLight + "20" }]}>
              <ThemedText type="small" style={{ color: theme.primary, fontSize: 10 }}>
                CUSTOM
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.goalRowRight}>
        <ThemedText type="h4" style={{ color: theme.primary }}>
          {value}{getDisplayUnit()}
        </ThemedText>
        {!isDefault && onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.deleteButton, { backgroundColor: theme.error + "15" }]}
          >
            <Feather name="trash-2" size={16} color={theme.error} />
          </Pressable>
        ) : (
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </View>
    </AnimatedPressable>
  );
}

const GOAL_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  exercise: "activity",
  water: "droplet",
  sleep: "moon",
  custom: "star",
};

type ModalType = "edit" | "add" | null;

export default function GoalsScreen() {
  const { theme } = useTheme();
  const { goals, updateGoal, addGoal, removeGoal } = useApp();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingGoal, setEditingGoal] = useState<{
    id: string;
    label: string;
    value: string;
    unit: string;
  } | null>(null);
  
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [error, setError] = useState("");

  const handleOpenEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setEditingGoal({
        id,
        label: goal.label,
        value: goal.value.toString(),
        unit: goal.unit,
      });
      setError("");
      setModalType("edit");
    }
  };

  const handleSaveEdit = () => {
    if (editingGoal) {
      const value = parseInt(editingGoal.value) || 0;
      if (value > 0) {
        updateGoal(editingGoal.id, value);
        setModalType(null);
        setEditingGoal(null);
      }
    }
  };

  const handleOpenAdd = () => {
    setNewLabel("");
    setNewValue("");
    setNewUnit("times/day");
    setError("");
    setModalType("add");
  };

  const handleAddGoal = () => {
    setError("");
    
    if (!newLabel.trim()) {
      setError("Goal name is required");
      return;
    }
    if (!newValue || parseInt(newValue) <= 0) {
      setError("Target value must be greater than 0");
      return;
    }
    if (!newUnit.trim()) {
      setError("Unit is required");
      return;
    }

    addGoal(newLabel.trim(), parseInt(newValue), newUnit.trim());
    setModalType(null);
  };

  const handleDeleteGoal = (id: string, label: string) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeGoal(id),
        },
      ]
    );
  };

  const getGoalIcon = (type: string): keyof typeof Feather.glyphMap => {
    return GOAL_ICONS[type] || "star";
  };

  const defaultGoals = goals.filter((g) => g.isDefault);
  const customGoals = goals.filter((g) => !g.isDefault);

  return (
    <ScreenScrollView>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Default Goals
      </ThemedText>

      <View style={styles.goalsContainer}>
        {defaultGoals.map((goal) => (
          <GoalRow
            key={goal.id}
            id={goal.id}
            label={goal.label}
            value={goal.value}
            unit={goal.unit}
            icon={getGoalIcon(goal.type)}
            isDefault={goal.isDefault}
            onPress={() => handleOpenEdit(goal.id)}
            theme={theme}
          />
        ))}
      </View>

      {customGoals.length > 0 ? (
        <>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.xl }}
          >
            Custom Goals
          </ThemedText>

          <View style={styles.goalsContainer}>
            {customGoals.map((goal) => (
              <GoalRow
                key={goal.id}
                id={goal.id}
                label={goal.label}
                value={goal.value}
                unit={goal.unit}
                icon={getGoalIcon(goal.type)}
                isDefault={goal.isDefault}
                onPress={() => handleOpenEdit(goal.id)}
                onDelete={() => handleDeleteGoal(goal.id, goal.label)}
                theme={theme}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.addButtonContainer}>
        <Pressable
          style={[styles.addButton, { borderColor: theme.primary }]}
          onPress={handleOpenAdd}
        >
          <Feather name="plus" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
            Add Goal
          </ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={modalType === "edit"}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Edit Goal</ThemedText>
              <Pressable
                onPress={() => setModalType(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="body" style={styles.editLabel}>
              {editingGoal?.label}
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
                maxLength={3}
              />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {editingGoal?.unit || ""}
              </ThemedText>
            </View>

            <Button onPress={handleSaveEdit}>Save</Button>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={modalType === "add"}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Add Custom Goal</ThemedText>
              <Pressable
                onPress={() => setModalType(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
                <ThemedText type="small" style={{ color: theme.error }}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Goal Name
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="e.g., Meditate, Read books"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Target Value
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.backgroundDefault,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={newValue}
                  onChangeText={setNewValue}
                  placeholder="e.g., 30"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Unit
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.backgroundDefault,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={newUnit}
                  onChangeText={setNewUnit}
                  placeholder="e.g., min/day"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <Button onPress={handleAddGoal}>Add Goal</Button>
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
    flex: 1,
  },
  goalTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
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
  customBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonContainer: {
    marginTop: Spacing.xl,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
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
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputHalf: {
    flex: 1,
  },
  textInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
});
