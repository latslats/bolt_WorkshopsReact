import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';
import { resetFirestoreClient } from './firebaseConnectionReset';

/**
 * Simple check if Firebase is initialized properly
 * Returns true if both auth and db are available
 */
export const checkFirebaseConnection = (): boolean => {
  try {
    // Just check if auth and db are initialized, don't make any network calls yet
    return !!auth && !!db;
  } catch (error) {
    console.error('Firebase initialization check error:', error);
    return false;
  }
};

/**
 * Local implementation of token refresh to avoid circular dependency with authService
 */
const refreshToken = async (): Promise<string | null> => {
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
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

/**
 * Resets Firestore connection by disabling and re-enabling the network connection
 * This can help resolve stuck connections and 400 Bad Request errors
 */
export const resetFirestoreConnection = async (): Promise<void> => {
  try {
    console.log('Resetting Firestore connection...');
    
    // Check if user is authenticated before resetting
    const currentUser = auth.currentUser;
    console.log('Current auth state:', currentUser ? `User authenticated (${currentUser.uid})` : 'No user authenticated');
    
    // If user is authenticated, refresh the token BEFORE disabling network
    // This helps with the 400 Bad Request errors
    if (currentUser) {
      try {
        console.log('Refreshing auth token before connection reset');
        await refreshToken();
      } catch (tokenError) {
        console.warn('Auth token refresh warning before reset:', tokenError);
        // Continue with reset even if token refresh fails
      }
    }
    
    // Use the resetFirestoreClient utility to terminate the client
    await resetFirestoreClient(db);
    
    // Check if we need to refresh the token after reconnection
    if (currentUser) {
      try {
        console.log('Refreshing auth token after connection reset');
        await currentUser.getIdToken(true);
        console.log('Auth token refreshed after reset');
      } catch (tokenError) {
        console.warn('Auth token refresh warning after reset:', tokenError);
        // Continue even if token refresh fails
      }
    }
    
    // Verify connection is active
    try {
      // Try a simple Firestore operation to verify connection
      const testRef = doc(db, 'users', 'connection_test');
      await getDoc(testRef);
      console.log('Firestore connection verified after reset');
    } catch (verifyError) {
      console.warn('Firestore connection verification failed:', verifyError);
      
      // If verification fails, try one more time with a different approach
      try {
        // Try to access a document in the users collection
        // If it doesn't exist, that's fine - we just want to test the connection
        const testDocId = auth.currentUser?.uid || 'connection_test';
        const userRef = doc(collection(db, 'users'), testDocId);
        await getDoc(userRef);
        console.log('Firestore connection verified with alternative method');
      } catch (secondVerifyError) {
        console.error('Second verification attempt also failed:', secondVerifyError);
        
        // If both verification attempts fail, try to re-enable network
        try {
          await enableNetwork(db);
          console.log('Network re-enabled after verification failures');
        } catch (enableError) {
          console.error('Failed to re-enable network after verification failures:', enableError);
        }
      }
    }
  } catch (error) {
    console.error('Error resetting Firestore connection:', error);
    // Try to re-enable network if an error occurred during the reset process
    try {
      await enableNetwork(db);
      console.log('Network re-enabled after error');
    } catch (enableError) {
      console.error('Failed to re-enable network after error:', enableError);
    }
  }
};

/**
 * Logs diagnostic information about Firebase connection
 * This is a non-blocking function that won't prevent app rendering
 */
export const logFirebaseStatus = async (): Promise<void> => {
  try {
    console.log('Firebase status check:');
    console.log('- Auth initialized:', !!auth);
    console.log('- Firestore initialized:', !!db);
    
    // Check auth state
    const currentUser = auth?.currentUser;
    console.log('- Current user:', currentUser ? `Signed in (${currentUser.uid})` : 'Not signed in');
    
    // Try a simple Firestore operation without blocking rendering
    setTimeout(async () => {
      if (currentUser) {
        // Try to refresh token first if user is signed in
        try {
          await refreshToken();
          console.log('- Auth token refreshed successfully');
        } catch (tokenError) {
          console.warn('- Auth token refresh failed:', tokenError);
        }
      }
      
      try {
        // First try the users collection which should be allowed by security rules
        const testRef = doc(collection(db, 'users'), 'connection_test');
        
        // Set a timestamp to test write access (this will likely fail for non-admins due to security rules)
        try {
          if (currentUser) {
            await setDoc(testRef, { 
              lastCheck: new Date().toISOString(),
              uid: currentUser.uid,
              status: 'online'
            }, { merge: true });
            console.log('- Firestore write test: Successful (admin user)');
          }
        } catch (writeErr) {
          // Expected to fail for non-admin users due to security rules
          console.log('- Firestore write test: Failed (expected for non-admin users)');
        }
        
        // Try to read the test document
        const docSnap = await getDoc(testRef);
        console.log('- Firestore read test: Successful');
        console.log('- Firestore connection status: ONLINE');
        
        // Set up a snapshot listener to continuously monitor connection status
        let unsubscribe = onSnapshot(testRef, 
          (doc) => {
            console.log('Firestore connection is active');
          },
          (error) => {
            console.error('Firestore connection error in listener:', error);
            // If we get a permission error, it could be a security rules issue
            if (error.code === 'permission-denied') {
              console.error('This appears to be a security rules issue - check firebase.rules');
            }
            // If offline, try to reset the connection
            if (error.message?.includes('offline')) {
              resetFirestoreConnection()
                .then(() => console.log('Attempted to reset Firestore connection after offline error'));
            }
          }
        );
        
        // Clean up the listener after 10 seconds
        setTimeout(() => {
          unsubscribe();
          console.log('Firestore connection monitoring ended');
        }, 10000);
        
      } catch (error: any) {
        console.warn('- Firestore read test: Failed', error);
        console.log('- Firestore connection status: OFFLINE or ERROR');
        
        // Check for specific token-related error messages
        const errorMessage = error?.message || '';
        if (
          errorMessage.includes('400') || 
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('token') ||
          errorMessage.includes('permission') ||
          errorMessage.includes('auth')
        ) {
          console.log('- Detected possible token issue, attempting to refresh token');
          try {
            await refreshToken();
            console.log('- Token refreshed after error detection');
            
            // Try to reset Firestore connection
            await resetFirestoreConnection();
          } catch (refreshError) {
            console.error('- Failed to refresh token after error:', refreshError);
          }
        }
        
        // For offline errors, try to reset connection
        if (errorMessage.includes('offline')) {
          console.log('- Attempting to reset Firestore connection after offline error');
          await resetFirestoreConnection();
        }
      }
    }, 2000);
  } catch (error) {
    console.error('Error checking Firebase status:', error);
  }
};

/**
 * Non-blocking function to check Firebase connection
 * This won't prevent the app from rendering
 */
export const ensureFirebaseConnection = (): void => {
  // Just check if Firebase is initialized
  const isInitialized = checkFirebaseConnection();
  
  if (!isInitialized) {
    console.error('Firebase not properly initialized. Some features may not work.');
  } else {
    console.log('Firebase initialization check passed.');
    
    // Log more detailed status information after a delay
    setTimeout(() => {
      logFirebaseStatus();
    }, 1000);
  }
};

export default {
  checkFirebaseConnection,
  logFirebaseStatus,
  ensureFirebaseConnection,
  resetFirestoreConnection
}; 