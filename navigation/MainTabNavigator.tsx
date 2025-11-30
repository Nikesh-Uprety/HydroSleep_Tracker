import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import WaterStackNavigator from "@/navigation/WaterStackNavigator";
import SleepStackNavigator from "@/navigation/SleepStackNavigator";
import GoalsStackNavigator from "@/navigation/GoalsStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { MainTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WaterTab"
        component={WaterStackNavigator}
        options={{
          title: "Water",
          tabBarIcon: ({ color, size }) => (
            <Feather name="droplet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SleepTab"
        component={SleepStackNavigator}
        options={{
          title: "Sleep",
          tabBarIcon: ({ color, size }) => (
            <Feather name="moon" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GoalsTab"
        component={GoalsStackNavigator}
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <Feather name="target" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
