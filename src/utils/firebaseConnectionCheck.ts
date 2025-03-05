import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { refreshAuthToken } from '../services/authService';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

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
        await refreshAuthToken();
      } catch (tokenError) {
        console.warn('Auth token refresh warning before reset:', tokenError);
        // Continue with reset even if token refresh fails
      }
    }
    
    // Temporarily disable network
    await disableNetwork(db);
    console.log('Network disabled temporarily');
    
    // Wait longer to ensure connections are fully closed
    // This is especially important for resolving 400 Bad Request errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Re-enable network
    await enableNetwork(db);
    console.log('Network re-enabled, connection should be fresh');
    
    // Wait a moment for the connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If user is authenticated, refresh the token AFTER re-enabling network
    // This ensures the token is fresh with the new connection
    if (currentUser) {
      try {
        console.log('Refreshing auth token after connection reset');
        await refreshAuthToken();
      } catch (tokenError) {
        console.warn('Auth token refresh warning after reset:', tokenError);
        // Don't throw here, as the main connection reset was successful
      }
    }
    
    // Verify connection is working by attempting a simple read
    let testRef;
    try {
      testRef = doc(collection(db, 'system_health_checks'), 'connection_test');
      await getDoc(testRef);
      console.log('Connection verification successful - Firestore is accessible');
    } catch (verifyError: Error | unknown) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Unknown error';
      console.warn('Connection verification warning:', errorMessage);
      
      // If we still have a 400 Bad Request or offline error, try a more aggressive approach
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request') || 
          errorMessage.includes('offline') || errorMessage.includes('unavailable')) {
        
        console.log('Still experiencing connection issues. Trying more aggressive reset...');
        
        // Try clearing browser storage for Firebase (this can help with corrupted IndexedDB)
        try {
          // Clear Firebase-related localStorage items
          Object.keys(localStorage).forEach(key => {
            if (key.includes('firebase') || key.includes('firestore')) {
              localStorage.removeItem(key);
            }
          });
          console.log('Cleared Firebase localStorage items');
          
          // Force another token refresh
          if (currentUser) {
            await currentUser.getIdToken(true);
            console.log('Forced another token refresh');
          }
          
          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try one more connection test
          if (testRef) {
            await getDoc(testRef);
            console.log('Connection successful after aggressive reset');
          }
        } catch (finalError) {
          console.error('Aggressive reset also failed:', finalError);
          console.log('You may need to clear browser data or restart the application');
        }
      }
    }
    
    return;
  } catch (error: Error | unknown) {
    console.error('Error resetting Firestore connection:', error);
    // Provide more detailed error information
    if (error && typeof error === 'object' && 'code' in error) {
      console.error(`Error code: ${error.code}`);
    }
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
    }
    throw error; // Re-throw to allow proper handling by caller
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
          await refreshAuthToken();
          console.log('- Auth token refreshed successfully');
        } catch (tokenError) {
          console.warn('- Auth token refresh failed:', tokenError);
        }
      }
      
      try {
        // First try the system health checks collection which should be allowed by security rules
        const testRef = doc(collection(db, 'system_health_checks'), 'connection_test');
        
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
            await refreshAuthToken();
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