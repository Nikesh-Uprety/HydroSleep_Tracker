import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const showSuccessToast = (message: string) => {
  if (toastRef.current) {
    toastRef.current.showToast({ message, type: "success" });
  }
};

export const showErrorToast = (message: string) => {
  if (toastRef.current) {
    toastRef.current.showToast({ message, type: "error" });
  }
};

export const showInfoToast = (message: string) => {
  if (toastRef.current) {
    toastRef.current.showToast({ message, type: "info" });
  }
};

const toastRef: { current: ToastContextValue | null } = { current: null };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (config: ToastConfig) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast(config);
      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, config.duration || 3000);
    },
    [translateY, opacity, hideToast]
  );

  useEffect(() => {
    toastRef.current = { showToast };
    return () => {
      toastRef.current = null;
    };
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getBackgroundColor = () => {
    switch (toast?.type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "info":
        return "#2563EB";
      default:
        return "#333333";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: getBackgroundColor(),
              transform: [{ translateY }],
              opacity,
              top: Platform.OS === "web" ? 20 : insets.top + 10,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
    alignItems: "center",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
