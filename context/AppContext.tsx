import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import api from "@/services/api";

interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: Date;
}

interface Goal {
  id: string;
  type: "exercise" | "water" | "sleep" | "custom";
  label: string;
  value: number;
  unit: string;
  isDefault: boolean;
}

interface SleepEntry {
  id: string;
  date: Date;
  durationMinutes: number;
  restedPercent: number;
  remPercent: number;
  deepSleepPercent: number;
}

interface WaterLog {
  id: string;
  date: Date;
  amountMl: number;
}

interface AnalyticsSummary {
  sleep: {
    days: string[];
    hours: number[];
    average: number;
  };
  water: {
    days: string[];
    liters: number[];
    dailyGoalLiters: number;
    goalMetCount: number;
  };
  goals: {
    totalGoals: number;
    completedToday: number;
    weeklyCompletionRatePercent: number;
  };
}

interface AppContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  goals: Goal[];
  sleepEntries: SleepEntry[];
  waterLogs: WaterLog[];
  sleepSuggestion: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileImage: (imageUrl: string) => Promise<{ success: boolean; error?: string }>;
  updateGoal: (id: string, value: number) => Promise<{ success: boolean; error?: string }>;
  addGoal: (label: string, value: number, unit: string) => Promise<{ success: boolean; error?: string }>;
  removeGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => Promise<{ success: boolean; error?: string }>;
  addWaterLog: (amountMl: number) => Promise<{ success: boolean; error?: string }>;
  getLatestSleep: () => SleepEntry | null;
  getWeeklyWater: () => { date: Date; amountMl: number }[];
  getWeeklySleep: () => { date: Date; durationMinutes: number }[];
  isWeeklyGoalMet: () => boolean;
  getTodayWater: () => number;
  getAnalyticsSummary: () => AnalyticsSummary;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.setDate(diff));
};

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getDayName = (date: Date): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
};

const DEFAULT_GOALS: Goal[] = [
  { id: "default-exercise", type: "exercise", label: "Exercise Regularly", value: 4, unit: "times/week", isDefault: true },
  { id: "default-water", type: "water", label: "Drink Water", value: 3, unit: "L/day", isDefault: true },
  { id: "default-sleep", type: "sleep", label: "Improve Sleep", value: 8, unit: "hours/night", isDefault: true },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [sleepSuggestion, setSleepSuggestion] = useState("Start tracking your sleep for personalized insights!");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const result = await api.getUser();
        if (result.data) {
          setUser({
            ...result.data,
            createdAt: new Date(result.data.createdAt),
          });
          setIsAuthenticated(true);
          await fetchAllData();
        }
      }
    } catch (error) {
      console.log("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [goalsResult, sleepResult, waterResult] = await Promise.all([
        api.getGoals(),
        api.getWeeklySleep(),
        api.getWeeklyWater(),
      ]);

      if (goalsResult.data) {
        setGoals(goalsResult.data);
      }

      if (sleepResult.data?.entries) {
        const entries = sleepResult.data.entries
          .filter((e: any) => e.entry)
          .map((e: any) => ({
            id: e.entry.id,
            date: new Date(e.date),
            durationMinutes: e.durationMinutes,
            restedPercent: e.entry.restedPercent,
            remPercent: e.entry.remPercent,
            deepSleepPercent: e.entry.deepSleepPercent,
          }));
        setSleepEntries(entries);
      }

      if (waterResult.data?.entries) {
        const logs = waterResult.data.entries
          .filter((e: any) => e.amountMl > 0)
          .map((e: any) => ({
            id: e.id || `water-${e.date}`,
            date: new Date(e.date),
            amountMl: e.amountMl,
          }));
        setWaterLogs(logs);
      }

      const latestSleepResult = await api.getLatestSleep();
      if (latestSleepResult.data?.suggestion) {
        setSleepSuggestion(latestSleepResult.data.suggestion);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.login(email, password);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser({
        ...result.data.user,
        createdAt: new Date(result.data.user.createdAt),
      });
      setIsAuthenticated(true);
      await fetchAllData();
      return { success: true };
    }

    return { success: false, error: "Login failed" };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.register(name, email, password);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser({
        ...result.data.user,
        createdAt: new Date(result.data.user.createdAt),
      });
      setIsAuthenticated(true);
      await fetchAllData();
      return { success: true };
    }

    return { success: false, error: "Signup failed" };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
    setGoals(DEFAULT_GOALS);
    setSleepEntries([]);
    setWaterLogs([]);
  };

  const updateProfile = async (displayName: string, email: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.updateProfile(displayName, email);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser({
        ...result.data,
        createdAt: new Date(result.data.createdAt),
      });
      return { success: true };
    }

    return { success: false, error: "Update failed" };
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.updatePassword(currentPassword, newPassword);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  };

  const updateProfileImage = async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.updateAvatar(imageUrl);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser({
        ...result.data,
        createdAt: new Date(result.data.createdAt),
      });
      return { success: true };
    }

    return { success: false, error: "Update failed" };
  };

  const updateGoal = async (id: string, value: number): Promise<{ success: boolean; error?: string }> => {
    const result = await api.updateGoal(id, value);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setGoals((prev) =>
        prev.map((goal) => (goal.id === id ? { ...goal, value } : goal))
      );
      return { success: true };
    }

    return { success: false, error: "Update failed" };
  };

  const addGoal = async (label: string, value: number, unit: string): Promise<{ success: boolean; error?: string }> => {
    const result = await api.createGoal(label, value, unit);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      setGoals((prev) => [...prev, result.data]);
      return { success: true };
    }

    return { success: false, error: "Create failed" };
  };

  const removeGoal = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const goal = goals.find((g) => g.id === id);
    if (!goal || goal.isDefault) {
      return { success: false, error: "Cannot delete default goals" };
    }

    const result = await api.deleteGoal(id);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    setGoals((prev) => prev.filter((g) => g.id !== id));
    return { success: true };
  };

  const addSleepEntry = async (entry: Omit<SleepEntry, "id">): Promise<{ success: boolean; error?: string }> => {
    const result = await api.addSleep({
      date: entry.date.toISOString(),
      durationMinutes: entry.durationMinutes,
      restedPercent: entry.restedPercent,
      remPercent: entry.remPercent,
      deepSleepPercent: entry.deepSleepPercent,
    });
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      const existingEntry = sleepEntries.find((e) => isSameDay(e.date, entry.date));
      if (existingEntry) {
        setSleepEntries((prev) =>
          prev.map((e) =>
            e.id === existingEntry.id ? { ...entry, id: e.id } : e
          )
        );
      } else {
        setSleepEntries((prev) => [{ ...entry, id: result.data.id }, ...prev]);
      }
      return { success: true };
    }

    return { success: false, error: "Add failed" };
  };

  const addWaterLog = async (amountMl: number): Promise<{ success: boolean; error?: string }> => {
    const result = await api.addWater(amountMl);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    if (result.data) {
      const today = new Date();
      const existingLog = waterLogs.find((log) => isSameDay(log.date, today));

      if (existingLog) {
        setWaterLogs((prev) =>
          prev.map((log) =>
            log.id === existingLog.id
              ? { ...log, amountMl: result.data.amountMl }
              : log
          )
        );
      } else {
        setWaterLogs((prev) => [
          ...prev,
          { id: result.data.id, date: today, amountMl: result.data.amountMl },
        ]);
      }
      return { success: true };
    }

    return { success: false, error: "Add failed" };
  };

  const getLatestSleep = (): SleepEntry | null => {
    if (sleepEntries.length === 0) return null;
    return sleepEntries.reduce((latest, entry) =>
      entry.date > latest.date ? entry : latest
    );
  };

  const getWeeklyWater = () => {
    const startOfWeek = getStartOfWeek();
    const result: { date: Date; amountMl: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const log = waterLogs.find((l) => isSameDay(l.date, date));
      result.push({
        date: new Date(date),
        amountMl: log ? log.amountMl : 0,
      });
    }

    return result;
  };

  const getWeeklySleep = () => {
    const startOfWeek = getStartOfWeek();
    const result: { date: Date; durationMinutes: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const entry = sleepEntries.find((e) => isSameDay(e.date, date));
      result.push({
        date: new Date(date),
        durationMinutes: entry ? entry.durationMinutes : 0,
      });
    }

    return result;
  };

  const isWeeklyGoalMet = (): boolean => {
    const waterGoal = goals.find((g) => g.type === "water");
    if (!waterGoal) return false;

    const dailyGoalMl = waterGoal.value * 1000;
    const weeklyData = getWeeklyWater();
    const today = new Date();

    return weeklyData.every((day) => {
      if (day.date > today) return true;
      return day.amountMl >= dailyGoalMl;
    });
  };

  const getTodayWater = (): number => {
    const today = new Date();
    const todayLog = waterLogs.find((log) => isSameDay(log.date, today));
    return todayLog ? todayLog.amountMl : 0;
  };

  const getAnalyticsSummary = (): AnalyticsSummary => {
    const weeklySleep = getWeeklySleep();
    const weeklyWater = getWeeklyWater();
    const waterGoal = goals.find((g) => g.type === "water");
    const sleepGoal = goals.find((g) => g.type === "sleep");
    const dailyGoalLiters = waterGoal?.value || 3;
    const dailyGoalMl = dailyGoalLiters * 1000;
    const sleepGoalMinutes = (sleepGoal?.value || 8) * 60;

    const sleepHours = weeklySleep.map((day) => 
      Math.round((day.durationMinutes / 60) * 10) / 10
    );
    const sleepDays = weeklySleep.map((day) => getDayName(day.date));
    const sleepAverage = sleepHours.length > 0
      ? Math.round((sleepHours.reduce((a, b) => a + b, 0) / sleepHours.filter(h => h > 0).length) * 100) / 100
      : 0;

    const waterLiters = weeklyWater.map((day) => 
      Math.round((day.amountMl / 1000) * 10) / 10
    );
    const waterDays = weeklyWater.map((day) => getDayName(day.date));
    const waterGoalMetCount = weeklyWater.filter(
      (day) => day.date <= new Date() && day.amountMl >= dailyGoalMl
    ).length;

    const today = new Date();
    let completedToday = 0;
    let weeklyCompletions = 0;
    let weeklyTotal = 0;

    goals.forEach((goal) => {
      if (goal.type === "water") {
        const todayWater = getTodayWater();
        if (todayWater >= dailyGoalMl) completedToday++;
        weeklyWater.forEach((day) => {
          if (day.date <= today) {
            weeklyTotal++;
            if (day.amountMl >= dailyGoalMl) weeklyCompletions++;
          }
        });
      } else if (goal.type === "sleep") {
        const latestSleep = getLatestSleep();
        if (latestSleep && latestSleep.durationMinutes >= sleepGoalMinutes) {
          completedToday++;
        }
        weeklySleep.forEach((day) => {
          if (day.date <= today && day.durationMinutes > 0) {
            weeklyTotal++;
            if (day.durationMinutes >= sleepGoalMinutes) weeklyCompletions++;
          }
        });
      }
    });

    const weeklyCompletionRate = weeklyTotal > 0
      ? Math.round((weeklyCompletions / weeklyTotal) * 100)
      : 0;

    return {
      sleep: {
        days: sleepDays,
        hours: sleepHours,
        average: sleepAverage || 0,
      },
      water: {
        days: waterDays,
        liters: waterLiters,
        dailyGoalLiters,
        goalMetCount: waterGoalMetCount,
      },
      goals: {
        totalGoals: goals.length,
        completedToday,
        weeklyCompletionRatePercent: weeklyCompletionRate,
      },
    };
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        goals,
        sleepEntries,
        waterLogs,
        sleepSuggestion,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        updateProfileImage,
        updateGoal,
        addGoal,
        removeGoal,
        addSleepEntry,
        addWaterLog,
        getLatestSleep,
        getWeeklyWater,
        getWeeklySleep,
        isWeeklyGoalMet,
        getTodayWater,
        getAnalyticsSummary,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
