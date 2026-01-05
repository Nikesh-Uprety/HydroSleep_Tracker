import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenTimeScreen from "@/screens/ScreenTimeScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { ScreenTimeStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<ScreenTimeStackParamList>();

export default function ScreenTimeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="ScreenTime"
        component={ScreenTimeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Screen Time" />,
        }}
      />
    </Stack.Navigator>
  );
}

