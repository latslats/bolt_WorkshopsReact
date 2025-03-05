import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult,
  onAuthStateChanged
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
 * Force refresh the user's ID token to ensure it's valid for Firestore operations
 * This helps resolve 400 Bad Request errors with Firestore after authentication
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in to refresh token');
      return null;
    }
    
    console.log('Forcing token refresh for user:', currentUser.uid);
    
    // Add a timeout to prevent hanging
    const tokenPromise = currentUser.getIdToken(true);
    const timeoutPromise = new Promise<string | null>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Token refresh timed out after 10 seconds'));
      }, 10000);
    });
    
    // Race the token refresh against the timeout
    const idToken = await Promise.race([tokenPromise, timeoutPromise]) as string;
    
    console.log('Token refreshed successfully');
    
    // Verify the token is valid by checking its length
    if (!idToken || idToken.length < 50) {
      console.warn('Refreshed token appears invalid (too short)');
      throw new Error('Invalid token received during refresh');
    }
    
    return idToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // If we have a current user but token refresh failed, try to reauthenticate
    if (auth.currentUser) {
      console.log('Token refresh failed but user is still authenticated. App may need to reauthenticate.');
    }
    
    return null;
  }
};

/**
 * Export getRedirectResult for use in components
 */
export const getRedirectResult = async () => {
  return firebaseGetRedirectResult(auth);
};

/**
 * Safely get a document from Firestore with retry logic
 */
const safeGetDoc = async (docRef: any, maxRetries = 3): Promise<any> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await getDoc(docRef);
    } catch (error: any) {
      console.error(`Error getting document (attempt ${retries + 1}/${maxRetries}):`, error);
      
      // If this is the last retry, throw the error
      if (retries === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      retries++;
    }
  }
};

/**
 * Safely set a document in Firestore with retry logic
 */
const safeSetDoc = async (docRef: any, data: any, options: any = {}, maxRetries = 3): Promise<void> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await setDoc(docRef, data, options);
    } catch (error: any) {
      console.error(`Error setting document (attempt ${retries + 1}/${maxRetries}):`, error);
      
      // If this is the last retry, throw the error
      if (retries === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      retries++;
    }
  }
};

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
    let userDoc;
    try {
      const userRef = doc(db, 'users', user.uid);
      userDoc = await safeGetDoc(userRef);
    } catch (firestoreError) {
      console.error('Error fetching user data from Firestore:', firestoreError);
      // Continue with basic user data if Firestore fetch fails
    }
    
    if (!userDoc?.exists()) {
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
      ...(userDoc?.exists() ? userDoc.data() as Partial<User> : {}),
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
    
    let result;
    try {
      // First try with popup
      console.log('Attempting sign in with popup');
      result = await Promise.race([
        signInWithPopup(auth, googleProvider),
        timeoutPromise
      ]) as any;
    } catch (popupError: any) {
      console.error('Popup sign-in failed:', popupError.code, popupError.message);
      
      // If popup was blocked or closed, try redirect method
      if (
        popupError.code === 'auth/popup-blocked' || 
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        console.log('Popup was blocked or closed, trying redirect method');
        // Store that we're attempting redirect auth
        localStorage.setItem('auth_redirect_pending', 'true');
        
        // Redirect will navigate away from the page, so we can't continue
        // The auth state will be handled when the user returns
        await signInWithRedirect(auth, googleProvider);
        
        // This code won't execute due to redirect, but we need to return something
        throw new Error('Redirecting to Google sign-in...');
      }
      
      // If there was a connection error, we can try again with redirect as a fallback
      if (
        popupError.code === 'auth/network-request-failed' ||
        popupError.message?.includes('network error') ||
        popupError.message?.includes('Network Error') ||
        popupError.message?.includes('fetch')
      ) {
        console.log('Network error detected during popup, trying redirect method');
        localStorage.setItem('auth_redirect_pending', 'true');
        
        // Force a small delay before the redirect to ensure any previous connections are closed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await signInWithRedirect(auth, googleProvider);
        throw new Error('Redirecting to Google sign-in...');
      }
      
      // For other errors, rethrow
      throw popupError;
    }
    
    // We successfully signed in with popup, reset Firestore connection before proceeding
    console.log('Successful sign-in, resetting Firestore connection before proceeding');
    
    // Reset Firestore connection to ensure a fresh connection
    try {
      const { resetFirestoreConnection } = await import('../utils/firebaseConnectionCheck');
      await resetFirestoreConnection();
      console.log('Firestore connection reset after successful authentication');
    } catch (resetError) {
      console.warn('Failed to reset Firestore connection:', resetError);
      // Continue anyway, as this is just a precaution
    }
    
    // Now refresh the token
    console.log('Refreshing auth token after successful authentication');
    const token = await refreshAuthToken();
    if (!token) {
      console.warn('Token refresh failed after successful authentication');
      // Try one more time with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshAuthToken();
    }
    
    // Process the authenticated user
    const user = result.user;
    const additionalInfo = getAdditionalUserInfo(result);
    
    console.log('Google sign-in successful, checking if user exists in Firestore');
    
    // Make sure we have a fresh token before accessing Firestore
    await user.getIdToken(true);
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    
    let userDoc;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Enhanced retry loop for Firestore operations
    while (retryCount < maxRetries) {
      try {
        // Try to get the user document
        console.log(`Attempting to fetch user document (attempt ${retryCount + 1}/${maxRetries})`);
        userDoc = await getDoc(userRef);
        console.log('Successfully fetched user document from Firestore');
        break; // If successful, exit the loop
      } catch (firestoreError: any) {
        retryCount++;
        console.error(`Error fetching user data from Firestore (attempt ${retryCount}/${maxRetries}):`, firestoreError);
        
        // Special handling for 400 Bad Request errors
        if (firestoreError.message?.includes('400') || firestoreError.message?.includes('Bad Request')) {
          console.log('Detected 400 Bad Request error, attempting to fix...');
          
          // Force token refresh
          await user.getIdToken(true);
          console.log('Forced token refresh to fix 400 Bad Request');
          
          // Reset Firestore connection
          try {
            const { resetFirestoreConnection } = await import('../utils/firebaseConnectionCheck');
            await resetFirestoreConnection();
            console.log('Reset Firestore connection to fix 400 Bad Request');
          } catch (resetError) {
            console.warn('Failed to reset connection:', resetError);
          }
          
          // Wait longer between retries for 400 errors
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue; // Try again immediately after reset
        }
        
        // Special handling for permission errors
        if (firestoreError.code === 'permission-denied') {
          console.error('Permission denied accessing Firestore. Check security rules.');
          // Force token refresh and try again
          await user.getIdToken(true);
        }
        
        // Special handling for offline errors
        if (firestoreError.message?.includes('offline')) {
          console.warn('Firestore reports client is offline. Waiting before retry...');
          
          // Try to reset the connection before retrying
          try {
            const { resetFirestoreConnection } = await import('../utils/firebaseConnectionCheck');
            await resetFirestoreConnection();
            console.log('Reset Firestore connection after offline error');
          } catch (resetError) {
            console.warn('Failed to reset connection:', resetError);
          }
          
          // Wait longer between retries for connectivity issues
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        } else {
          // Standard backoff for other errors
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // If this is the last retry, we'll continue with basic user data
        if (retryCount === maxRetries) {
          console.warn('Max retries reached for Firestore. Proceeding with basic user data.');
        }
      }
    }
    
    // Check if user is admin
    const isAdmin = await isUserAdmin(user.email || '');
    console.log('User admin status:', isAdmin);
    
    // Prepare basic user data in case Firestore operations fail
    const basicUserData = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      role: isAdmin ? 'admin' : 'student' as 'admin' | 'student',
      photoURL: user.photoURL || '',
      registeredWorkshops: [],
      completedWorkshops: [],
      lastLoginAt: new Date().toISOString(),
    };
    
    // If user doesn't exist or this is their first time using Google, create a new document
    if (!userDoc?.exists() || additionalInfo?.isNewUser) {
      console.log('Creating new user document in Firestore for Google user');
      const newUserData = {
        name: user.displayName || 'Google User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        registeredWorkshops: [],
        completedWorkshops: [],
        role: isAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      
      // Retry user document creation if needed
      retryCount = 0;
      while (retryCount < maxRetries) {
        try {
          // Use setDoc with merge option to ensure we don't overwrite existing data
          await setDoc(userRef, newUserData, { merge: true });
          console.log('User document created successfully for Google user');
          break; // If successful, exit the loop
        } catch (docError: any) {
          retryCount++;
          console.error(`Error creating user document (attempt ${retryCount}/${maxRetries}):`, docError);
          
          // Special handling for permission errors
          if (docError.code === 'permission-denied') {
            console.error('Permission denied creating user document. Check security rules.');
            // Force token refresh
            await user.getIdToken(true);
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
          
          // If this is the last retry, we'll continue with basic user data
          if (retryCount === maxRetries) {
            console.warn('Max retries reached for creating user document. Proceeding with basic user data.');
            return basicUserData;
          }
        }
      }
    } else {
      console.log('Existing user found in Firestore for Google sign-in');
      
      // Update the user's last login timestamp and role if needed
      try {
        await setDoc(userRef, { 
          lastLoginAt: new Date().toISOString(),
          role: isAdmin ? 'admin' : userDoc.data().role || 'student'
        }, { merge: true });
        console.log('Updated user login timestamp in Firestore');
      } catch (error: any) {
        console.error('Error updating user login timestamp:', error);
        // Non-critical error, continue with data we have
      }
    }
    
    // Get the latest user data
    console.log('Fetching updated user data from Firestore');
    let finalUserDoc;
    try {
      finalUserDoc = await getDoc(userRef);
    } catch (firestoreError) {
      console.error('Error fetching updated user data from Firestore:', firestoreError);
      // Return basic user data if final fetch fails
      return basicUserData;
    }
    
    const userData = {
      ...basicUserData,
      ...(finalUserDoc?.exists() ? finalUserDoc.data() as Partial<User> : {}),
    } as User;
    
    console.log('Returning Google user data:', userData);
    return userData;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Check if a user is already signed in despite the error
    if (auth.currentUser) {
      console.log('User is authenticated despite sign-in error. Returning basic user data.');
      const currentUser = auth.currentUser;
      return {
        id: currentUser.uid,
        name: currentUser.displayName || 'User',
        email: currentUser.email || '',
        role: 'student',
        photoURL: currentUser.photoURL || '',
        registeredWorkshops: [],
        completedWorkshops: [],
      } as User;
    }
    
    throw error;
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
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await safeGetDoc(userRef);
    
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
    
    // If user document doesn't exist, create a basic one
    try {
      const basicUserData = {
        name: currentUser.displayName || 'User',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        registeredWorkshops: [],
        completedWorkshops: [],
        role: 'student',
        createdAt: new Date().toISOString(),
      };
      
      await safeSetDoc(userRef, basicUserData, { merge: true });
      console.log('Created basic user document in Firestore');
      
      return {
        id: currentUser.uid,
        ...basicUserData
      } as User;
    } catch (createError) {
      console.error('Error creating basic user document:', createError);
      
      // Return basic user data even if document creation fails
      return {
        id: currentUser.uid,
        name: currentUser.displayName || 'User',
        email: currentUser.email || '',
        role: 'student',
        photoURL: currentUser.photoURL || '',
        registeredWorkshops: [],
        completedWorkshops: [],
      } as User;
    }
  } catch (error: any) {
    console.error('Error getting current user data:', error.code, error.message);
    
    // Return basic user data even if Firestore fails
    return {
      id: currentUser.uid,
      name: currentUser.displayName || 'User',
      email: currentUser.email || '',
      role: 'student',
      photoURL: currentUser.photoURL || '',
      registeredWorkshops: [],
      completedWorkshops: [],
    } as User;
  }
};

/**
 * Initialize auth state listener to handle auth state changes
 * This is particularly important for handling redirect authentication
 */
export const initAuthStateListener = (callback: (user: User | null) => void) => {
  console.log('Setting up auth state listener');
  
  // Set up the auth state listener
  return onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
    
    if (user) {
      // Refresh token immediately to ensure it's valid for Firestore operations
      try {
        console.log('Refreshing auth token in auth state change');
        await refreshAuthToken();
      } catch (error) {
        console.error('Error refreshing token in auth state change:', error);
        // Continue even if refresh fails
      }
      
      try {
        // Get user data from Firestore
        const userData = await getCurrentUserData();
        
        // If we got user data, call the callback
        if (userData) {
          callback(userData);
        } else {
          // If getCurrentUserData returned null (which shouldn't happen with our updates),
          // create a basic user object
          const basicUserData = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'student',
            photoURL: user.photoURL || '',
            registeredWorkshops: [],
            completedWorkshops: [],
          } as User;
          
          callback(basicUserData);
        }
      } catch (error) {
        console.error('Error getting user data in auth state listener:', error);
        
        // If we can't get the user data, still return basic info
        const basicUserData = {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'student',
          photoURL: user.photoURL || '',
          registeredWorkshops: [],
          completedWorkshops: [],
        } as User;
        
        callback(basicUserData);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Get a fresh ID token, optionally forcing a refresh
 * This is useful for ensuring the token is valid before making authenticated requests
 */
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No current user found when getting ID token');
    return null;
  }
  
  try {
    console.log('Getting ID token, force refresh:', forceRefresh);
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error: any) {
    console.error('Error getting ID token:', error.code, error.message);
    
    // If there's a token error, it might indicate the session is invalid
    if (
      error.code === 'auth/user-token-expired' || 
      error.code === 'auth/user-disabled' ||
      error.code === 'auth/internal-error'
    ) {
      console.log('Token error detected, signing out user');
      // Sign out the user to force re-authentication
      await signOut();
    }
    
    return null;
  }
};

/**
 * Validate the current user session
 * Returns true if the session is valid, false otherwise
 */
export const validateSession = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No current user found when validating session');
    return false;
  }
  
  try {
    console.log('Validating session for user:', user.uid);
    // Try to get a fresh token to validate the session
    const token = await getIdToken(true);
    return !!token;
  } catch (error: any) {
    console.error('Session validation error:', error.code, error.message);
    return false;
  }
}; 