import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Goal {
  type: "exercise" | "water" | "sleep";
  value: number;
  unit: string;
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

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  goals: Goal[];
  sleepEntries: SleepEntry[];
  waterLogs: WaterLog[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateGoal: (type: Goal["type"], value: number) => void;
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => void;
  addWaterLog: (amountMl: number) => void;
  getLatestSleep: () => SleepEntry | null;
  getWeeklyWater: () => { date: Date; amountMl: number }[];
  isWeeklyGoalMet: () => boolean;
  getTodayWater: () => number;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([
    { type: "exercise", value: 4, unit: "times/week" },
    { type: "water", value: 3, unit: "L/day" },
    { type: "sleep", value: 8, unit: "hours/night" },
  ]);

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
    {
      id: "1",
      date: new Date(Date.now() - 86400000),
      durationMinutes: 485,
      restedPercent: 90,
      remPercent: 25,
      deepSleepPercent: 20,
    },
  ]);

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
        email: email,
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
        email: email,
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateGoal = (type: Goal["type"], value: number) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.type === type ? { ...goal, value } : goal))
    );
  };

  const addSleepEntry = (entry: Omit<SleepEntry, "id">) => {
    setSleepEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
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
        updateGoal,
        addSleepEntry,
        addWaterLog,
        getLatestSleep,
        getWeeklyWater,
        isWeeklyGoalMet,
        getTodayWater,
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
