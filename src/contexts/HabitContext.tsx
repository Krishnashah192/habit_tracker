import React, { createContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export type HabitType = 'spiritual' | 'emotional' | 'economical' | 'mental' | 'general' | 'physical';

export interface Habit {
  id: string;
  name: string;
  description: string;
  type: HabitType;
  createdAt: string;
  userId: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

interface HabitContextType {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading: boolean;
  error: string | null;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string, notes?: string) => void;
  getHabitLogsForDate: (date: string) => HabitLog[];
  getHabitById: (id: string) => Habit | undefined;
  getCompletionRate: (habitId: string, days?: number) => number;
  getCurrentStreak: (habitId: string) => number;
}

export const HabitContext = createContext<HabitContextType>({
  habits: [],
  habitLogs: [],
  isLoading: false,
  error: null,
  addHabit: () => {},
  updateHabit: () => {},
  deleteHabit: () => {},
  toggleHabitCompletion: () => {},
  getHabitLogsForDate: () => [],
  getHabitById: () => undefined,
  getCompletionRate: () => 0,
  getCurrentStreak: () => 0,
});

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear data when logged out
      setHabits([]);
      setHabitLogs([]);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      saveData();
    }
  }, [habits, habitLogs, user]);

  const loadData = () => {
    setIsLoading(true);
    try {
      const savedHabits = localStorage.getItem(`habits-${user?.id}`);
      const savedLogs = localStorage.getItem(`habitLogs-${user?.id}`);
      
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedLogs) setHabitLogs(JSON.parse(savedLogs));
    } catch (err) {
      setError('Failed to load habits data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem(`habits-${user?.id}`, JSON.stringify(habits));
      localStorage.setItem(`habitLogs-${user?.id}`, JSON.stringify(habitLogs));
    } catch (err) {
      setError('Failed to save habits data');
      console.error(err);
    }
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    };
    
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const deleteHabit = (id: string) => {
    // Delete the habit
    setHabits(habits.filter(habit => habit.id !== id));
    
    // Delete all associated logs
    setHabitLogs(habitLogs.filter(log => log.habitId !== id));
  };

  const toggleHabitCompletion = (habitId: string, date: string, notes?: string) => {
    const existingLog = habitLogs.find(
      log => log.habitId === habitId && log.date === date
    );
    
    if (existingLog) {
      // Toggle completion if log exists
      setHabitLogs(habitLogs.map(log => 
        log.id === existingLog.id 
          ? { ...log, completed: !log.completed, notes: notes ?? log.notes } 
          : log
      ));
    } else {
      // Create new log if it doesn't exist
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completed: true,
        notes,
      };
      
      setHabitLogs([...habitLogs, newLog]);
    }
  };

  const getHabitLogsForDate = (date: string): HabitLog[] => {
    return habitLogs.filter(log => log.date === date);
  };

  const getHabitById = (id: string): Habit | undefined => {
    return habits.find(habit => habit.id === id);
  };

  const getCompletionRate = (habitId: string, days = 30): number => {
    // Get logs for this habit in the last `days` days
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    const relevantLogs = habitLogs.filter(log => {
      const logDate = new Date(log.date);
      return log.habitId === habitId && 
             logDate >= startDate && 
             logDate <= today;
    });
    
    if (relevantLogs.length === 0) return 0;
    
    const completedCount = relevantLogs.filter(log => log.completed).length;
    return (completedCount / days) * 100;
  };

  const getCurrentStreak = (habitId: string): number => {
    // Sort logs by date (descending)
    const habitLogsForId = habitLogs
      .filter(log => log.habitId === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitLogsForId.length === 0) return 0;
    
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if the latest log is from today and is completed
    const latestLog = habitLogsForId[0];
    if (latestLog.date !== today || !latestLog.completed) {
      return 0; // Streak broken if today's habit not completed
    }
    
    // Count consecutive completed days
    for (let i = 0; i < habitLogsForId.length; i++) {
      const log = habitLogsForId[i];
      if (log.completed) {
        streak++;
      } else {
        break; // Streak ends at first non-completed log
      }
    }
    
    return streak;
  };

  return (
    <HabitContext.Provider 
      value={{
        habits,
        habitLogs,
        isLoading,
        error,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabitLogsForDate,
        getHabitById,
        getCompletionRate,
        getCurrentStreak,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};