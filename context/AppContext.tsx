import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  password: string;
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
  user: User | null;
  goals: Goal[];
  sleepEntries: SleepEntry[];
  waterLogs: WaterLog[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (displayName: string, email: string) => boolean;
  updatePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateProfileImage: (imageUrl: string) => void;
  updateGoal: (id: string, value: number) => void;
  addGoal: (label: string, value: number, unit: string) => void;
  removeGoal: (id: string) => boolean;
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => void;
  addWaterLog: (amountMl: number) => void;
  getLatestSleep: () => SleepEntry | null;
  getWeeklyWater: () => { date: Date; amountMl: number }[];
  getWeeklySleep: () => { date: Date; durationMinutes: number }[];
  isWeeklyGoalMet: () => boolean;
  getTodayWater: () => number;
  getAnalyticsSummary: () => AnalyticsSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

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
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(() => {
    const entries: SleepEntry[] = [];
    const startOfWeek = getStartOfWeek();
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      if (date <= new Date()) {
        entries.push({
          id: generateId(),
          date: new Date(date),
          durationMinutes: Math.floor(Math.random() * 120) + 360,
          restedPercent: Math.floor(Math.random() * 20) + 75,
          remPercent: Math.floor(Math.random() * 10) + 20,
          deepSleepPercent: Math.floor(Math.random() * 10) + 15,
        });
      }
    }
    return entries;
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const logs: WaterLog[] = [];
    const startOfWeek = getStartOfWeek();
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      if (date <= new Date()) {
        logs.push({
          id: generateId(),
          date: new Date(date),
          amountMl: Math.floor(Math.random() * 1500) + 2000,
        });
      }
    }
    return logs;
  });

  const login = (email: string, password: string): boolean => {
    if (email && password) {
      setUser({
        id: generateId(),
        name: "Alex",
        displayName: "Alex",
        email: email,
        password: password,
        profileImageUrl: null,
        createdAt: new Date(),
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    if (name && email && password) {
      setUser({
        id: generateId(),
        name: name,
        displayName: name,
        email: email,
        password: password,
        profileImageUrl: null,
        createdAt: new Date(),
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setGoals(DEFAULT_GOALS);
  };

  const updateProfile = (displayName: string, email: string): boolean => {
    if (!user) return false;
    if (!displayName.trim() || !email.trim()) return false;
    
    setUser({
      ...user,
      displayName: displayName.trim(),
      email: email.trim(),
    });
    return true;
  };

  const updatePassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: "Not logged in" };
    
    if (currentPassword !== user.password) {
      return { success: false, error: "Current password is incorrect" };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }
    
    setUser({
      ...user,
      password: newPassword,
    });
    return { success: true };
  };

  const updateProfileImage = (imageUrl: string) => {
    if (!user) return;
    setUser({
      ...user,
      profileImageUrl: imageUrl,
    });
  };

  const updateGoal = (id: string, value: number) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, value } : goal))
    );
  };

  const addGoal = (label: string, value: number, unit: string) => {
    const newGoal: Goal = {
      id: generateId(),
      type: "custom",
      label: label.trim(),
      value,
      unit: unit.trim(),
      isDefault: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const removeGoal = (id: string): boolean => {
    const goal = goals.find((g) => g.id === id);
    if (!goal || goal.isDefault) return false;
    
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  const addSleepEntry = (entry: Omit<SleepEntry, "id">) => {
    const existingEntry = sleepEntries.find((e) => isSameDay(e.date, entry.date));
    if (existingEntry) {
      setSleepEntries((prev) =>
        prev.map((e) =>
          e.id === existingEntry.id ? { ...entry, id: e.id } : e
        )
      );
    } else {
      setSleepEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
    }
  };

  const addWaterLog = (amountMl: number) => {
    const today = new Date();
    const existingLog = waterLogs.find((log) => isSameDay(log.date, today));

    if (existingLog) {
      setWaterLogs((prev) =>
        prev.map((log) =>
          log.id === existingLog.id
            ? { ...log, amountMl: log.amountMl + amountMl }
            : log
        )
      );
    } else {
      setWaterLogs((prev) => [
        ...prev,
        { id: generateId(), date: today, amountMl },
      ]);
    }
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
        user,
        goals,
        sleepEntries,
        waterLogs,
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
