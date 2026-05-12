import { useState, useEffect } from "react";
import { Goal, FocusSession, Distraction, Habit, Profile } from "../lib/types";
import { supabase } from "../lib/supabase";

const GOALS_KEY = "vela_goals";
const SESSIONS_KEY = "vela_sessions";
const DISTRACTIONS_KEY = "vela_distractions";
const STREAK_KEY = "vela_streak_data";
const HABITS_KEY = "vela_habits";

interface StreakData {
  count: number;
  freezes: number;
  completedDays: string[]; // ISO dates
  lastUpdate: string;
}

interface UserData {
  name: string;
  plan: string;
}

const initialStreak: StreakData = {
  count: 0,
  freezes: 0,
  completedDays: [],
  lastUpdate: new Date().toISOString()
};

const initialDistractions: Distraction[] = [];

const initialUser: UserData = {
  name: "Пользователь",
  plan: "Free",
};

const initialHabits: Habit[] = [];

const initialGoals: Goal[] = [];

export function useFocusStore() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [distractions, setDistractions] = useState<Distraction[]>(initialDistractions);
  const [streak, setStreak] = useState<StreakData>(initialStreak);
  const [user, setUser] = useState<UserData>(initialUser);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Supabase session and localStorage on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          name: metadata?.first_name || session.user.email?.split('@')[0] || "Пользователь",
          plan: metadata?.plan || "Pro",
        });
      }

      // Load all registered users from database
      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .order("first_name", { ascending: true });
        
        if (!error && profiles) {
          setAllUsers(profiles);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }

      if (typeof window !== "undefined") {
        const savedGoals = localStorage.getItem(GOALS_KEY);
        if (savedGoals) setGoals(JSON.parse(savedGoals));

        const savedSessions = localStorage.getItem(SESSIONS_KEY);
        if (savedSessions) setSessions(JSON.parse(savedSessions));

        const savedDistractions = localStorage.getItem(DISTRACTIONS_KEY);
        if (savedDistractions) setDistractions(JSON.parse(savedDistractions));

        const savedStreak = localStorage.getItem(STREAK_KEY);
        if (savedStreak) setStreak(JSON.parse(savedStreak));

        const savedHabits = localStorage.getItem(HABITS_KEY);
        if (savedHabits) setHabits(JSON.parse(savedHabits));

        setIsLoaded(true);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          name: metadata?.first_name || session.user.email?.split('@')[0] || "Пользователь",
          plan: metadata?.plan || "Pro",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(DISTRACTIONS_KEY, JSON.stringify(distractions));
  }, [distractions, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits, isLoaded]);

  const addGoal = (goal: Goal) => {
    setGoals((prev) => [goal, ...prev]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addSession = (session: FocusSession) => {
    setSessions((prev) => [...prev, session]);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const addDistraction = (d: Distraction) => {
    setDistractions((prev) => [...prev, d]);
  };

  const updateDistraction = (updated: Distraction) => {
    setDistractions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const deleteDistraction = (id: string) => {
    setDistractions((prev) => prev.filter((d) => d.id !== id));
  };

  const useFreeze = () => {
    if (streak.freezes > 0) {
      setStreak(prev => ({
        ...prev,
        freezes: prev.freezes - 1,
        lastUpdate: new Date().toISOString()
      }));
      return true;
    }
    return false;
  };

  const addFreeze = () => {
    setStreak(prev => ({
      ...prev,
      freezes: prev.freezes + 1
    }));
  };

  const completeDay = (date: string = new Date().toISOString().split('T')[0]) => {
    if (!streak.completedDays.includes(date)) {
      setStreak(prev => ({
        ...prev,
        count: prev.count + 1,
        completedDays: [...prev.completedDays, date],
        lastUpdate: new Date().toISOString()
      }));
    }
  };

  const isLost = () => {
    if (!streak.lastUpdate) return false;
    const last = new Date(streak.lastUpdate);
    const now = new Date();
    const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    return diff > 48; // Lost if not updated for more than 48 hours
  };

  return {
    goals,
    setGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    sessions,
    addSession,
    deleteSession,
    distractions,
    addDistraction,
    updateDistraction,
    deleteDistraction,
    streak,
    useFreeze,
    addFreeze,
    completeDay,
    updateStreak: (data: Partial<StreakData>) => setStreak(prev => ({ ...prev, ...data })),
    isLost: isLost(),
    user,
    setUser,
    allUsers,
    habits,
    addHabit: (h: Habit) => setHabits(prev => [...prev, h]),
    updateHabit: (updated: Habit) => setHabits(prev => prev.map(h => h.id === updated.id ? updated : h)),
    deleteHabit: (id: string) => setHabits(prev => prev.filter(h => h.id !== id)),
  };
}
