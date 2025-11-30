import { Platform } from "react-native";

const primaryBlue = "#2563EB";
const primaryBlueLight = "#3B82F6";

export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#687076",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: primaryBlue,
    link: primaryBlue,
    primary: primaryBlue,
    primaryLight: primaryBlueLight,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8FAFC",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E2E8F0",
    cardBackground: "#FFFFFF",
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#E2E8F0",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryBlueLight,
    link: primaryBlueLight,
    primary: primaryBlueLight,
    primaryLight: primaryBlue,
    backgroundRoot: "#1F2123",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    cardBackground: "#2A2C2E",
    success: "#10B981",
    successLight: "#064E3B",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
