import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/types/navigation";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showErrorToast("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        showSuccessToast("Login successful!");
      } else {
        showErrorToast(result.error || "Invalid credentials");
      }
    } catch (error) {
      showErrorToast("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + Spacing["2xl"] },
          ]}
        >
          <View style={styles.illustrationContainer}>
            <Image
              source={require("@/assets/images/illustrations/woman_with_water_glass_illustration.png")}
              style={styles.illustration}
              contentFit="contain"
            />
          </View>

          <ThemedText type="h2" style={styles.title}>
            Welcome Back!
          </ThemedText>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <Button onPress={handleLogin} style={styles.button} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Log In"
              )}
            </Button>

            <View style={styles.signupContainer}>
              <ThemedText type="small" style={styles.signupText}>
                Don't have an account?{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("SignUp")} disabled={isLoading}>
                <ThemedText
                  type="small"
                  style={[styles.signupLink, { color: theme.primary }]}
                >
                  Sign Up
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  illustration: {
    width: 200,
    height: 200,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  form: {
    gap: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    marginTop: Spacing.sm,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  signupText: {
    opacity: 0.7,
  },
  signupLink: {
    fontWeight: "600",
  },
});
