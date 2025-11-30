import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GoalsScreen from "@/screens/GoalsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { GoalsStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export default function GoalsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Goals" />,
        }}
      />
    </Stack.Navigator>
  );
}
