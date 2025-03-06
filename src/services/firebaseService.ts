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

// User Services
export const getUsers = async (): Promise<User[]> => {
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
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// Workshop Services
export const getWorkshops = async (): Promise<Workshop[]> => {
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
  try {
    await deleteDoc(doc(db, 'workshops', workshopId));
  } catch (error) {
    console.error(`Error deleting workshop ${workshopId}:`, error);
    throw error;
  }
};

// Registration Services
export const registerUserForWorkshop = async (userId: string, workshopId: string): Promise<void> => {
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
        
        // Update workshop's registered count and registrations array
        const workshopRef = doc(db, 'workshops', workshopId);
        const workshopDoc = await getDoc(workshopRef);
        
        if (workshopDoc.exists()) {
          const workshopData = workshopDoc.data();
          const registrations = workshopData.registrations || [];
          
          // Only add the user if they're not already in the registrations array
          if (!registrations.includes(userId)) {
            await updateDoc(workshopRef, {
              registered: (workshopData.registered || 0) + 1,
              registrations: [...registrations, userId],
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error registering user ${userId} for workshop ${workshopId}:`, error);
    throw error; // Re-throw the error so it can be caught by the caller
  }
};

export const unregisterUserFromWorkshop = async (userId: string, workshopId: string): Promise<void> => {
  try {
    // Update user's registered workshops
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const registeredWorkshops = userData.registeredWorkshops || [];
      
      if (registeredWorkshops.includes(workshopId)) {
        await updateDoc(userRef, {
          registeredWorkshops: registeredWorkshops.filter((id: string) => id !== workshopId),
          updatedAt: serverTimestamp()
        });
        
        // Update workshop's registered count
        const workshopRef = doc(db, 'workshops', workshopId);
        const workshopDoc = await getDoc(workshopRef);
        
        if (workshopDoc.exists()) {
          const workshopData = workshopDoc.data();
          const currentRegistered = workshopData.registered || 0;
          
          if (currentRegistered > 0) {
            await updateDoc(workshopRef, {
              registered: currentRegistered - 1,
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
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('registeredWorkshops', 'array-contains', workshopId));
    const userSnapshot = await getDocs(q);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error(`Error fetching registrations for workshop ${workshopId}:`, error);
    throw error;
  }
};

export const getUserRegistrations = async (userId: string): Promise<Workshop[]> => {
  try {
    const user = await getUserById(userId);
    if (!user || !user.registeredWorkshops || user.registeredWorkshops.length === 0) {
      return [];
    }
    
    const registeredWorkshops: Workshop[] = [];
    for (const workshopId of user.registeredWorkshops) {
      const workshop = await getWorkshopById(workshopId);
      if (workshop) {
        registeredWorkshops.push(workshop);
      }
    }
    
    return registeredWorkshops;
  } catch (error) {
    console.error(`Error fetching registrations for user ${userId}:`, error);
    throw error;
  }
};
