import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/screens/LoginScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { AuthStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}
