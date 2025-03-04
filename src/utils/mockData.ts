import { Workshop, User } from '../types';

// Mock workshops data
const mockWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'AI Vibe Coding Workshop',
    description: 'A 3-session workshop introducing Python coding with Cursor IDE and AI assistance.',
    instructor: 'john-doe',
    date: '2023-06-14',
    sessions: 3,
    level: 'Beginner',
    tags: ['Python', 'AI', 'Cursor IDE'],
    capacity: 20,
    registered: 8,
    materials: ['intro.pdf', 'exercises.zip']
  },
  {
    id: '2',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
    instructor: 'jane-smith',
    date: '2023-06-20',
    sessions: 5,
    level: 'Beginner',
    tags: ['HTML', 'CSS', 'JavaScript'],
    capacity: 25,
    registered: 15
  },
  {
    id: '3',
    title: 'React for Beginners',
    description: 'Get started with React and build modern, interactive UIs.',
    instructor: 'john-doe',
    date: '2023-07-05',
    sessions: 4,
    level: 'Intermediate',
    tags: ['React', 'JavaScript', 'Frontend'],
    capacity: 20,
    registered: 12
  },
  {
    id: '4',
    title: 'Data Science with Python',
    description: 'Introduction to data analysis and visualization using Python libraries.',
    instructor: 'sarah-johnson',
    date: '2023-07-15',
    sessions: 6,
    level: 'Intermediate',
    tags: ['Python', 'Data Science', 'Pandas', 'Matplotlib'],
    capacity: 18,
    registered: 10
  }
];

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'instructor',
    registeredWorkshops: []
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'instructor',
    registeredWorkshops: []
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'instructor',
    registeredWorkshops: []
  },
  {
    id: '4',
    name: 'Test User',
    email: 'user@example.com',
    role: 'student',
    registeredWorkshops: ['1', '3']
  }
];

// Function to initialize mock data in localStorage
export const setupMockData = () => {
  if (!localStorage.getItem('workshops')) {
    localStorage.setItem('workshops', JSON.stringify(mockWorkshops));
  }
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
};

// Function to get workshops from localStorage
export const getWorkshops = (): Workshop[] => {
  const workshops = localStorage.getItem('workshops');
  return workshops ? JSON.parse(workshops) : [];
};

// Function to get users from localStorage
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

// Function to get a user by ID
export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Function to get a workshop by ID
export const getWorkshopById = (id: string): Workshop | undefined => {
  const workshops = getWorkshops();
  return workshops.find(workshop => workshop.id === id);
};
