import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/types/navigation";

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Dashboard">;
};

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  theme: any;
  highlight?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DashboardCard({
  title,
  subtitle,
  icon,
  onPress,
  theme,
  highlight = false,
}: DashboardCardProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: highlight ? theme.primary : theme.cardBackground },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: highlight ? "rgba(255,255,255,0.2)" : theme.backgroundDefault },
        ]}
      >
        <Feather name={icon} size={24} color={highlight ? "#FFFFFF" : theme.primary} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText
          type="body"
          style={[styles.cardTitle, highlight && { color: "#FFFFFF" }]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            type="small"
            style={{ color: highlight ? "rgba(255,255,255,0.8)" : theme.textSecondary }}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={highlight ? "rgba(255,255,255,0.8)" : theme.textSecondary}
      />
    </AnimatedPressable>
  );
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { theme } = useTheme();
  const { user, getTodayWater, getLatestSleep, goals } = useApp();

  const todayWater = getTodayWater();
  const waterGoal = goals.find((g) => g.type === "water");
  const waterProgress = waterGoal
    ? Math.min((todayWater / (waterGoal.value * 1000)) * 100, 100).toFixed(0)
    : 0;

  const latestSleep = getLatestSleep();
  const sleepHours = latestSleep
    ? Math.floor(latestSleep.durationMinutes / 60)
    : 0;
  const sleepMins = latestSleep ? latestSleep.durationMinutes % 60 : 0;

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Hello, {user?.displayName || user?.name || "Guest"}
        </ThemedText>
      </View>

      <View style={styles.cardsContainer}>
        <DashboardCard
          title="Analytics"
          subtitle="View your weekly insights"
          icon="bar-chart-2"
          onPress={() => navigation.navigate("Analytics")}
          theme={theme}
          highlight
        />

        <DashboardCard
          title="Water Intake"
          subtitle={`${waterProgress}% of daily goal`}
          icon="droplet"
          onPress={() => navigation.navigate("WaterReport")}
          theme={theme}
        />

        <DashboardCard
          title="Sleep Tracker"
          subtitle={
            latestSleep
              ? `Last night: ${sleepHours}h ${sleepMins}m`
              : "No data yet"
          }
          icon="moon"
          onPress={() => navigation.navigate("SleepReport")}
          theme={theme}
        />

        <DashboardCard
          title="Sleep Report"
          subtitle="View detailed analysis"
          icon="pie-chart"
          onPress={() => navigation.navigate("SleepReport")}
          theme={theme}
        />

        <DashboardCard
          title="Goals"
          subtitle="Track your daily targets"
          icon="target"
          onPress={() => navigation.navigate("Goals")}
          theme={theme}
        />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  cardsContainer: {
    gap: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
});
