import { User, Workshop } from '../types';

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Julio V',
    email: 'julio.v@earthrated.com',
    role: 'admin',
    registeredWorkshops: ['1', '3']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'student',
    registeredWorkshops: ['1', '2']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'instructor',
    registeredWorkshops: ['3']
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'student',
    registeredWorkshops: ['2', '4']
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    role: 'student',
    registeredWorkshops: ['1', '4']
  }
];

// Mock workshops data
export const mockWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the basics of React and build your first component.',
    instructor: 'Bob Johnson',
    date: '2023-10-15',
    sessions: 4,
    level: 'Beginner',
    tags: ['React', 'JavaScript', 'Frontend'],
    capacity: 20,
    registered: 15,
    materials: ['React Docs', 'CodeSandbox']
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript features and advanced type systems.',
    instructor: 'Alice Chen',
    date: '2023-10-22',
    sessions: 3,
    level: 'Advanced',
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    capacity: 15,
    registered: 10,
    materials: ['TypeScript Handbook', 'GitHub Repo']
  },
  {
    id: '3',
    title: 'Firebase Fundamentals',
    description: 'Learn how to integrate Firebase into your web applications.',
    instructor: 'David Kim',
    date: '2023-11-05',
    sessions: 2,
    level: 'Intermediate',
    tags: ['Firebase', 'Backend', 'Database'],
    capacity: 25,
    registered: 18,
    materials: ['Firebase Documentation', 'Sample Code']
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    description: 'Understand the core principles of effective UI/UX design.',
    instructor: 'Emma Wilson',
    date: '2023-11-12',
    sessions: 5,
    level: 'Beginner',
    tags: ['Design', 'UI', 'UX'],
    capacity: 30,
    registered: 25,
    materials: ['Figma Templates', 'Design Guidelines']
  },
  {
    id: '5',
    title: 'Node.js API Development',
    description: 'Build robust APIs with Node.js and Express.',
    instructor: 'Frank Thomas',
    date: '2023-11-19',
    sessions: 4,
    level: 'Intermediate',
    tags: ['Node.js', 'API', 'Backend'],
    capacity: 20,
    registered: 12,
    materials: ['API Documentation', 'GitHub Repo']
  }
];

// Function to get workshop registrations by user
export const getWorkshopRegistrationsByUser = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user || !user.registeredWorkshops) return [];
  
  return user.registeredWorkshops.map(workshopId => 
    mockWorkshops.find(w => w.id === workshopId)
  ).filter(Boolean) as Workshop[];
};

// Function to get users registered for a workshop
export const getUsersForWorkshop = (workshopId: string) => {
  return mockUsers.filter(user => 
    user.registeredWorkshops?.includes(workshopId)
  );
};

// Function to get current user based on email
export const getCurrentUser = () => {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'julio.v@earthrated.com';
  return mockUsers.find(user => user.email === adminEmail) || mockUsers[0];
};

// Add the missing setupMockData function
export const setupMockData = () => {
  // This function can be used to initialize mock data
  // For now, it's just a placeholder since the data is already defined above
  console.log('Mock data initialized');
  
  // If needed, you could store the mock data in localStorage here
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  localStorage.setItem('mockWorkshops', JSON.stringify(mockWorkshops));
  
  return { users: mockUsers, workshops: mockWorkshops };
};
