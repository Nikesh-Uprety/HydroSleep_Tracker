import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

type ModalType = "profile" | "password" | null;

export default function AccountScreen() {
  const { theme } = useTheme();
  const { user, logout, updateProfile, updatePassword, updateProfileImage } = useApp();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Feature Unavailable", "Run in Expo Go to use this feature");
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please grant camera roll access to change your profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setIsLoading(true);
      try {
        await updateProfileImage(result.assets[0].uri);
      } catch (e) {
        Alert.alert("Error", "Failed to update profile image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile(displayName.trim(), email.trim());
      if (result.success) {
        setModalType(null);
        setError("");
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updatePassword(currentPassword, newPassword);
      if (result.success) {
        setModalType(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        Alert.alert("Success", "Password updated successfully");
      } else {
        setError(result.error || "Failed to update password");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        logout();
      }
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log Out", style: "destructive", onPress: () => logout() },
        ]
      );
    }
  };

  const openEditProfile = () => {
    setDisplayName(user?.displayName || "");
    setEmail(user?.email || "");
    setError("");
    setModalType("profile");
  };

  const openChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setModalType("password");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.profileSection}>
        <Pressable onPress={handlePickImage} style={styles.avatarContainer} disabled={isLoading}>
          {user?.profileImageUrl ? (
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <ThemedText type="h1" style={{ color: "#FFFFFF" }}>
                {user?.displayName?.charAt(0).toUpperCase() || "?"}
              </ThemedText>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Feather name="camera" size={14} color="#FFFFFF" />
          </View>
        </Pressable>

        <ThemedText type="h3" style={styles.displayName}>
          {user?.displayName || "User"}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {user?.email || ""}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          Member since {user?.createdAt ? formatDate(user.createdAt) : ""}
        </ThemedText>
      </View>

      <View style={styles.menuSection}>
        <Pressable
          style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
          onPress={openEditProfile}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="user" size={20} color={theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body">Edit Profile</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Update your name and email
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
          onPress={openChangePassword}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="lock" size={20} color={theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body">Change Password</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Update your password
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.logoutSection}>
        <Pressable
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
          onPress={handleLogout}
        >
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Log Out
          </ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={modalType === "profile"}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Edit Profile</ThemedText>
              <Pressable
                onPress={() => setModalType(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
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
                Display Name
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Email
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <Button onPress={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={modalType === "password"}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Change Password</ThemedText>
              <Pressable
                onPress={() => setModalType(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
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
                Current Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                New Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Confirm New Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <Button onPress={handleChangePassword} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Update Password"
              )}
            </Button>
          </ThemedView>
        </View>
      </Modal>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  displayName: {
    marginBottom: Spacing.xs,
  },
  menuSection: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  logoutSection: {
    marginTop: Spacing["3xl"],
  },
  logoutButton: {
    height: 52,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
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
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
});
