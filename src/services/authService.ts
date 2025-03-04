import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { User } from '../types';

// Configure Google provider with additional scopes if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting to sign in with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Firebase auth successful, fetching user data from Firestore');
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.warn('User document not found in Firestore for uid:', user.uid);
    } else {
      console.log('User document found in Firestore');
    }
    
    const userData = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      role: 'student', // Default role
      photoURL: user.photoURL || '',
      ...(userDoc.exists() ? userDoc.data() as Partial<User> : {}),
    } as User;
    
    console.log('Returning user data:', userData);
    return userData;
  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    throw error;
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log('Attempting to sign in with Google');
    
    // Create a timeout promise that rejects after 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Google sign-in timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the sign-in promise against the timeout
    const result = await Promise.race([
      signInWithPopup(auth, googleProvider),
      timeoutPromise
    ]) as any;
    
    const user = result.user;
    const additionalInfo = getAdditionalUserInfo(result);
    
    console.log('Google sign-in successful, checking if user exists in Firestore');
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    // Check if user is admin
    const isAdmin = await isUserAdmin(user.email || '');
    console.log('User admin status:', isAdmin);
    
    // If user doesn't exist or this is their first time using Google, create a new document
    if (!userDoc.exists() || additionalInfo?.isNewUser) {
      console.log('Creating new user document in Firestore for Google user');
      const newUserData = {
        name: user.displayName || 'Google User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        registeredWorkshops: [],
        completedWorkshops: [],
        role: isAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
      };
      
      try {
        // Use setDoc with merge option to ensure we don't overwrite existing data
        await setDoc(userRef, newUserData, { merge: true });
        console.log('User document created successfully for Google user');
      } catch (docError: any) {
        console.error('Error creating user document for Google user:', docError.code, docError.message);
        // Continue even if document creation fails - we'll return basic user data
      }
    } else {
      console.log('Existing user found in Firestore for Google sign-in');
      
      // Update the user's role if they are an admin
      if (isAdmin) {
        try {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          console.log('Updated existing user role to admin in Firestore');
        } catch (error: any) {
          console.error('Error updating admin role for existing user:', error.code, error.message);
        }
      }
    }
    
    // Get the latest user data
    console.log('Fetching updated user data from Firestore');
    const finalUserDoc = await getDoc(userRef);
    
    const userData = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      role: isAdmin ? 'admin' : 'student', // Set role based on admin status
      photoURL: user.photoURL || '',
      registeredWorkshops: [],
      completedWorkshops: [],
      ...(finalUserDoc.exists() ? finalUserDoc.data() as Partial<User> : {}),
    } as User;
    
    console.log('Returning Google user data:', userData);
    return userData;
  } catch (error: any) {
    console.error('Google login error:', error.code || 'NO_CODE', error.message);
    
    // Handle specific error cases
    if (error.message && error.message.includes('timed out')) {
      throw new Error('Google sign-in timed out. Please try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Multiple popup requests were triggered. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Failed to sign in with Google. Please try again later.');
    }
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (name: string, email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting to create new user with email:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User created in Firebase Auth, updating profile with name');
    // Update profile with name
    try {
      await updateProfile(user, {
        displayName: name
      });
      console.log('Profile updated successfully');
    } catch (profileError: any) {
      console.error('Error updating profile:', profileError.code, profileError.message);
      // Continue even if profile update fails
    }
    
    console.log('Creating user document in Firestore');
    // Create user document in Firestore
    const userData = {
      name,
      email,
      photoURL: user.photoURL || '',
      registeredWorkshops: [],
      completedWorkshops: [],
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    
    // Create a reference to the user document
    const userRef = doc(db, 'users', user.uid);
    
    try {
      // Use setDoc with merge option to ensure we don't overwrite existing data
      await setDoc(userRef, userData, { merge: true });
      console.log('User document created successfully in Firestore');
    } catch (docError: any) {
      console.error('Error creating user document in Firestore:', docError.code, docError.message);
      // Continue even if document creation fails - we'll return basic user data
    }
    
    // Verify the user document was created by reading it back
    try {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.warn('User document not found in Firestore after creation attempt');
      } else {
        console.log('User document verified in Firestore');
      }
    } catch (verifyError: any) {
      console.error('Error verifying user document:', verifyError.code, verifyError.message);
    }
    
    const returnUserData = {
      id: user.uid,
      name,
      email,
      photoURL: user.photoURL || '',
      registeredWorkshops: [],
      completedWorkshops: [],
      role: 'student',
    } as User;
    
    console.log('Returning new user data:', returnUserData);
    return returnUserData;
  } catch (error: any) {
    console.error('Signup error:', error.code, error.message);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    console.log('Attempting to sign out user');
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    return true;
  } catch (error: any) {
    console.error('Sign out error:', error.code, error.message);
    throw error;
  }
};

/**
 * Check if a user is an admin
 */
export const isUserAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  console.log('Checking if user is admin:', email);
  // Check if the email matches the admin email in environment variables
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  console.log('Admin email from env:', adminEmail);
  
  const isAdmin = email === adminEmail;
  console.log('Is admin?', isAdmin);
  
  // If user is admin, update their role in Firestore
  if (isAdmin && auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { role: 'admin' }, { merge: true });
      console.log('Updated user role to admin in Firestore');
    } catch (error: any) {
      console.error('Error updating admin role in Firestore:', error.code, error.message);
    }
  }
  
  return isAdmin;
};

/**
 * Get current user data from Firestore
 */
export const getCurrentUserData = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('No current user found in Firebase Auth');
    return null;
  }
  
  console.log('Current user found in Firebase Auth:', currentUser.uid);
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      console.log('User document found in Firestore');
      const userData = {
        id: currentUser.uid,
        name: currentUser.displayName || 'User',
        email: currentUser.email || '',
        role: 'student', // Default role
        photoURL: currentUser.photoURL || '',
        ...(userDoc.data() as Partial<User>),
      } as User;
      
      console.log('Returning current user data:', userData);
      return userData;
    }
    
    console.warn('User document not found in Firestore');
    return null;
  } catch (error: any) {
    console.error('Error getting current user data:', error.code, error.message);
    return null;
  }
}; 