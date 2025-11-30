import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WaterReportScreen from "@/screens/WaterReportScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { WaterStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<WaterStackParamList>();

export default function WaterStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="WaterReport"
        component={WaterReportScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Water" />,
        }}
      />
    </Stack.Navigator>
  );
}
