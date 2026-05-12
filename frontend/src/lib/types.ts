export interface Subtask {
  id: string;
  title: string;
  duration: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  subtasks: Subtask[];
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
  history: boolean[]; // last 7 days
}

export interface FocusSession {
  id: string;
  startTime: string;
  duration: number; // in seconds
}

