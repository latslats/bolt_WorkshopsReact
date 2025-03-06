export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  registeredWorkshops?: string[];
  completedWorkshops?: string[];
  photoURL?: string;
  status?: 'Active' | 'Inactive';
  createdAt?: any; // Firebase Timestamp - using any to avoid serialization issues
  lastLogin?: any; // Firebase Timestamp - using any to avoid serialization issues
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
  imageUrl?: string;
  registrations?: string[]; // Array of user IDs who registered
  attendance?: string[]; // Array of user IDs who attended
  schedule?: ScheduleItem[]; // Workshop schedule details
  prerequisites?: string[]; // List of prerequisites for the workshop
}

export interface ScheduleItem {
  time: string; // e.g., "10:00 AM - 11:30 AM"
  title: string; // e.g., "Introduction to React Hooks"
  description?: string; // Optional detailed description
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
  filters: {
    search: string;
    difficulty: string | null;
    topic: string | null;
    sortBy: 'date' | 'difficulty';
  };
}
