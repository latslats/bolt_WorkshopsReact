export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  registeredWorkshops?: string[];
  completedWorkshops?: string[];
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructor: {
    name: string;
    bio: string;
    photoURL: string;
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  sessions: Session[];
  prerequisites: string[];
  materials: string[];
  imageUrl: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registeredUsers: number;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  content: string;
  materials?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  workshopId: string;
  content: string;
  timestamp: string;
}
