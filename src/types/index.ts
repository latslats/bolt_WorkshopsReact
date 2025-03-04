export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  registeredWorkshops?: string[];
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  sessions: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  capacity: number;
  registered: number;
  materials?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

export interface WorkshopsState {
  workshops: Workshop[];
  filteredWorkshops: Workshop[];
  loading: boolean;
  error: string | null;
}
