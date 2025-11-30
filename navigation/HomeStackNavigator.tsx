import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "@/screens/DashboardScreen";
import SleepReportScreen from "@/screens/SleepReportScreen";
import WaterReportScreen from "@/screens/WaterReportScreen";
import GoalsScreen from "@/screens/GoalsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { HomeStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Dashboard" />,
        }}
      />
      <Stack.Screen
        name="SleepReport"
        component={SleepReportScreen}
        options={{
          headerTitle: "Sleep Report",
        }}
      />
      <Stack.Screen
        name="WaterReport"
        component={WaterReportScreen}
        options={{
          headerTitle: "Water Report",
        }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          headerTitle: "Goals",
        }}
      />
    </Stack.Navigator>
  );
}
