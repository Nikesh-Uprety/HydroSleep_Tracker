import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SleepReportScreen from "@/screens/SleepReportScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { SleepStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<SleepStackParamList>();

export default function SleepStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="SleepReport"
        component={SleepReportScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Sleep" />,
        }}
      />
    </Stack.Navigator>
  );
}
