import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Workshop } from '../types';
import { mockUsers, mockWorkshops, getWorkshopRegistrationsByUser, getUsersForWorkshop, getCurrentUser } from '../utils/mockData';

// Check if we're using mock data
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// User Services
export const getUsers = async (): Promise<User[]> => {
  if (useMockData) return mockUsers;
  
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  if (useMockData) return mockUsers.find(user => user.id === userId) || null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  if (useMockData) {
    const newUser = { 
      ...userData, 
      id: (mockUsers.length + 1).toString(),
      registeredWorkshops: []
    };
    mockUsers.push(newUser);
    return newUser;
  }
  
  try {
    const userCollection = collection(db, 'users');
    const newUserRef = await addDoc(userCollection, {
      ...userData,
      registeredWorkshops: [],
      createdAt: serverTimestamp()
    });
    
    return { 
      id: newUserRef.id, 
      ...userData,
      registeredWorkshops: []
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  if (useMockData) {
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    }
    return;
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      ...userData,
      updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (useMockData) {
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// Workshop Services
export const getWorkshops = async (): Promise<Workshop[]> => {
  if (useMockData) return mockWorkshops;
  
  try {
    const workshopsCollection = collection(db, 'workshops');
    const workshopSnapshot = await getDocs(workshopsCollection);
    return workshopSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workshop));
  } catch (error) {
    console.error('Error fetching workshops:', error);
    throw error;
  }
};

export const getWorkshopById = async (workshopId: string): Promise<Workshop | null> => {
  if (useMockData) return mockWorkshops.find(workshop => workshop.id === workshopId) || null;
  
  try {
    const workshopDoc = await getDoc(doc(db, 'workshops', workshopId));
    if (workshopDoc.exists()) {
      return { id: workshopDoc.id, ...workshopDoc.data() } as Workshop;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching workshop ${workshopId}:`, error);
    throw error;
  }
};

export const createWorkshop = async (workshopData: Omit<Workshop, 'id'>): Promise<Workshop> => {
  if (useMockData) {
    const newWorkshop = { 
      ...workshopData, 
      id: (mockWorkshops.length + 1).toString() 
    };
    mockWorkshops.push(newWorkshop);
    return newWorkshop;
  }
  
  try {
    const workshopCollection = collection(db, 'workshops');
    const newWorkshopRef = await addDoc(workshopCollection, {
      ...workshopData,
      createdAt: serverTimestamp()
    });
    
    return { 
      id: newWorkshopRef.id, 
      ...workshopData 
    };
  } catch (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }
};

export const updateWorkshop = async (workshopId: string, workshopData: Partial<Workshop>): Promise<void> => {
  if (useMockData) {
    const workshopIndex = mockWorkshops.findIndex(workshop => workshop.id === workshopId);
    if (workshopIndex !== -1) {
      mockWorkshops[workshopIndex] = { ...mockWorkshops[workshopIndex], ...workshopData };
    }
    return;
  }
  
  try {
    const workshopRef = doc(db, 'workshops', workshopId);
    await updateDoc(workshopRef, { 
      ...workshopData,
      updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error(`Error updating workshop ${workshopId}:`, error);
    throw error;
  }
};

export const deleteWorkshop = async (workshopId: string): Promise<void> => {
  if (useMockData) {
    const workshopIndex = mockWorkshops.findIndex(workshop => workshop.id === workshopId);
    if (workshopIndex !== -1) {
      mockWorkshops.splice(workshopIndex, 1);
    }
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'workshops', workshopId));
  } catch (error) {
    console.error(`Error deleting workshop ${workshopId}:`, error);
    throw error;
  }
};

// Registration Services
export const registerUserForWorkshop = async (userId: string, workshopId: string): Promise<void> => {
  if (useMockData) {
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      if (!mockUsers[userIndex].registeredWorkshops) {
        mockUsers[userIndex].registeredWorkshops = [];
      }
      if (!mockUsers[userIndex].registeredWorkshops?.includes(workshopId)) {
        mockUsers[userIndex].registeredWorkshops?.push(workshopId);
      }
      
      const workshopIndex = mockWorkshops.findIndex(workshop => workshop.id === workshopId);
      if (workshopIndex !== -1) {
        mockWorkshops[workshopIndex].registered += 1;
      }
    }
    return;
  }
  
  try {
    // Update user's registered workshops
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const registeredWorkshops = userData.registeredWorkshops || [];
      
      if (!registeredWorkshops.includes(workshopId)) {
        await updateDoc(userRef, {
          registeredWorkshops: [...registeredWorkshops, workshopId],
          updatedAt: serverTimestamp()
        });
        
        // Update workshop's registered count
        const workshopRef = doc(db, 'workshops', workshopId);
        const workshopDoc = await getDoc(workshopRef);
        
        if (workshopDoc.exists()) {
          const workshopData = workshopDoc.data();
          await updateDoc(workshopRef, {
            registered: (workshopData.registered || 0) + 1,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error registering user ${userId} for workshop ${workshopId}:`, error);
    throw error;
  }
};

export const unregisterUserFromWorkshop = async (userId: string, workshopId: string): Promise<void> => {
  if (useMockData) {
    const userIndex = mockUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1 && mockUsers[userIndex].registeredWorkshops) {
      const registeredIndex = mockUsers[userIndex].registeredWorkshops?.indexOf(workshopId);
      if (registeredIndex !== -1 && registeredIndex !== undefined) {
        mockUsers[userIndex].registeredWorkshops?.splice(registeredIndex, 1);
      }
      
      const workshopIndex = mockWorkshops.findIndex(workshop => workshop.id === workshopId);
      if (workshopIndex !== -1 && mockWorkshops[workshopIndex].registered > 0) {
        mockWorkshops[workshopIndex].registered -= 1;
      }
    }
    return;
  }
  
  try {
    // Update user's registered workshops
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const registeredWorkshops = userData.registeredWorkshops || [];
      
      if (registeredWorkshops.includes(workshopId)) {
        await updateDoc(userRef, {
          registeredWorkshops: registeredWorkshops.filter(id => id !== workshopId),
          updatedAt: serverTimestamp()
        });
        
        // Update workshop's registered count
        const workshopRef = doc(db, 'workshops', workshopId);
        const workshopDoc = await getDoc(workshopRef);
        
        if (workshopDoc.exists()) {
          const workshopData = workshopDoc.data();
          if (workshopData.registered > 0) {
            await updateDoc(workshopRef, {
              registered: workshopData.registered - 1,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error unregistering user ${userId} from workshop ${workshopId}:`, error);
    throw error;
  }
};

export const getWorkshopRegistrations = async (workshopId: string): Promise<User[]> => {
  if (useMockData) return getUsersForWorkshop(workshopId);
  
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('registeredWorkshops', 'array-contains', workshopId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error(`Error fetching registrations for workshop ${workshopId}:`, error);
    throw error;
  }
};

export const getUserRegistrations = async (userId: string): Promise<Workshop[]> => {
  if (useMockData) return getWorkshopRegistrationsByUser(userId);
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const registeredWorkshops = userData.registeredWorkshops || [];
      
      if (registeredWorkshops.length === 0) return [];
      
      const workshops: Workshop[] = [];
      
      for (const workshopId of registeredWorkshops) {
        const workshopDoc = await getDoc(doc(db, 'workshops', workshopId));
        if (workshopDoc.exists()) {
          workshops.push({ id: workshopDoc.id, ...workshopDoc.data() } as Workshop);
        }
      }
      
      return workshops;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching registrations for user ${userId}:`, error);
    throw error;
  }
};
