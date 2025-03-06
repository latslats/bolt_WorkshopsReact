import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  connectFirestoreEmulator, 
  CACHE_SIZE_UNLIMITED, 
  initializeFirestore, 
  enableMultiTabIndexedDbPersistence, 
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { resetFirestoreClient } from '../utils/firebaseConnectionReset';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase with project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
console.log('Firebase Auth initialized');

// Set persistence to LOCAL to keep users logged in even after browser refresh
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Auth persistence set to LOCAL'))
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });
} catch (err) {
  console.error('Failed to set auth persistence:', err);
}

// Configure Google provider with improved settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with improved initialization for better reliability
export let db: Firestore;

// Create a function to reset Firestore connection that can be exported
export const resetFirestoreConnection = async (): Promise<void> => {
  try {
    await resetFirestoreClient(db);
  } catch (resetError) {
    console.warn('Error resetting Firestore connection:', resetError);
  }
};

// Track connection state for better error handling
export let firestoreConnectionActive = false;

// Initialize Firebase Storage
export const storage = getStorage(app);
console.log('Firebase Storage initialized');

try {
  // Try to initialize Firestore with modern settings for better reliability
  db = initializeFirestore(app, {
    // Use the new persistent cache with multiple tab support
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }),
    // Use long polling for more reliable connections in problematic networks
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true
  });
  
  console.log('Firestore initialized with modern cache configuration using default database');
  
  // Add connection state listeners to help debug connection issues
  import('firebase/firestore').then(({ onSnapshotsInSync, enableNetwork, disableNetwork }) => {
    // Listen for sync events to know when Firestore is synced with server
    onSnapshotsInSync(db, () => {
      console.log('Firestore snapshots in sync with server');
      firestoreConnectionActive = true;
    });
    
    // Add network state listeners
    window.addEventListener('online', async () => {
      console.log('Network connection restored, re-enabling Firestore network');
      try {
        // Reset connection first to clear any stale state
        await resetFirestoreConnection();
        // Then enable network
        await enableNetwork(db);
        console.log('Firestore network re-enabled');
        firestoreConnectionActive = true;
      } catch (error) {
        console.error('Error re-enabling Firestore network:', error);
        firestoreConnectionActive = false;
      }
    });
    
    window.addEventListener('offline', async () => {
      console.log('Network connection lost, disabling Firestore network');
      try {
        await disableNetwork(db);
        console.log('Firestore network disabled');
        firestoreConnectionActive = false;
      } catch (error) {
        console.error('Error disabling Firestore network:', error);
      }
    });
  }).catch(err => {
    console.error('Error setting up Firestore connection listeners:', err);
  });
} catch (firestoreInitError) {
  console.error('Error initializing Firestore with modern options:', firestoreInitError);
  console.log('Falling back to standard Firestore initialization with legacy persistence');
  
  // Fall back to standard initialization with default database
  db = getFirestore(app);
  
  // Try to enable basic persistence as fallback
  try {
    // Use the modern persistence API
    import('firebase/firestore').then(({ initializeFirestore, persistentLocalCache, CACHE_SIZE_UNLIMITED }) => {
      // Reinitialize with the modern API and default database
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
      });
      console.log('Firestore reinitialized with modern persistence API using default database');
      firestoreConnectionActive = true;
    }).catch(err => {
      console.error('Error reinitializing Firestore with modern API:', err);
      
      // If that fails, try the legacy persistence API
      enableMultiTabIndexedDbPersistence(db)
        .then(() => {
          console.log('Legacy multi-tab persistence enabled successfully');
          firestoreConnectionActive = true;
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multi-tab persistence not available - falling back to single-tab persistence');
            // Fall back to single-tab persistence
            enableIndexedDbPersistence(db)
              .then(() => {
                console.log('Single-tab persistence enabled successfully');
                firestoreConnectionActive = true;
              })
              .catch(e => console.warn('Single-tab persistence also failed:', e));
          } else {
            console.warn('Firestore persistence could not be enabled:', err);
          }
        });
    });
  } catch (persistenceError) {
    console.error('Error setting up persistence:', persistenceError);
  }
}

// Test Firestore connectivity with better error handling
setTimeout(async () => {
  try {
    // We'll just import what we need here to avoid reference issues
    const { collection, doc, getDoc, enableNetwork, disableNetwork } = await import('firebase/firestore');
    
    // Check if we need to refresh auth token before Firestore operations
    if (auth.currentUser) {
      try {
        console.log('Refreshing auth token before Firestore connection test');
        const token = await auth.currentUser.getIdToken(true);
        if (!token || token.length < 50) {
          throw new Error('Invalid token received during refresh');
        }
        console.log('Token refreshed successfully before connection test');
      } catch (tokenError) {
        console.warn('Token refresh before connection test failed:', tokenError);
        // Reset Firestore connection on token error
        await resetFirestoreConnection();
      }
    }
    
    // Reset Firestore client before testing connection
    await resetFirestoreConnection();
    
    // Try to access a document in the users collection
    // If it doesn't exist, that's fine - we just want to test the connection
    const testDocId = auth.currentUser?.uid || 'connection_test';
    const userRef = doc(collection(db, 'users'), testDocId);
    
    // First try to enable network explicitly
    try {
      await enableNetwork(db);
      console.log('Network explicitly enabled before connection test');
    } catch (enableError) {
      console.warn('Error enabling network before test:', enableError);
    }
    
    // Now try to get the document
    await getDoc(userRef);
    console.log('✅ Firestore connection test successful');
    firestoreConnectionActive = true;
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error.message);
    firestoreConnectionActive = false;
    
    // Check for specific error types and provide more helpful messages
    if (error.code === 'permission-denied') {
      console.error('This looks like a Firestore security rules issue - check your rules configuration');
      console.log('Make sure you have deployed the firestore.rules file to your Firebase project');
      console.log('You can deploy rules using: firebase deploy --only firestore:rules');
    } else if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.error('Network appears to be offline or Firestore is unavailable. Will retry when online.');
      
      // Try to reset the connection more aggressively
      try {
        const { enableNetwork, disableNetwork } = await import('firebase/firestore');
        
        // Disable network first
        await disableNetwork(db);
        console.log('Network disabled for aggressive reset');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Re-enable network
        await enableNetwork(db);
        console.log('Network re-enabled after aggressive reset');
        
        // Add an online listener to retry when connection is restored
        window.addEventListener('online', () => {
          console.log('🔄 Network connection restored, attempting to reconnect to Firestore');
          
          // Use local variables instead of importing from './firebase'
          const localDb = db;
          const localAuth = auth;
          const localResetFirestoreConnection = resetFirestoreConnection;
          
          // Refresh token first
          if (localAuth.currentUser) {
            try {
              localAuth.currentUser.getIdToken(true)
                .then(token => {
                  if (!token || token.length < 50) {
                    throw new Error('Invalid token received during reconnection');
                  }
                  console.log('Token refreshed before reconnection attempt');
                  
                  // Reset Firestore connection on token error
                  return localResetFirestoreConnection();
                })
                .then(() => {
                  import('firebase/firestore').then(async ({ collection, doc, getDoc, enableNetwork }) => {
                    // Then explicitly enable network
                    try {
                      await enableNetwork(localDb);
                      console.log('Firestore network explicitly enabled');
                      firestoreConnectionActive = true;
                    } catch (networkError) {
                      console.warn('Error enabling Firestore network:', networkError);
                      firestoreConnectionActive = false;
                    }
                    
                    // Test connection
                    const healthRef = doc(collection(localDb, 'users'), 'connection_test');
                    getDoc(healthRef)
                      .then(() => console.log('✅ Firestore reconnection successful'))
                      .catch((e: Error) => {
                        console.error('❌ Firestore reconnection failed:', e);
                        
                        // If reconnection fails, try resetting the Firestore client
                        try {
                          // @ts-ignore - Accessing internal Firebase property to reset connection
                          if (localDb._delegate._firestoreClient) {
                            console.log('Resetting Firestore client after failed reconnection');
                            // @ts-ignore
                            localDb._delegate._firestoreClient.terminate();
                          }
                        } catch (resetError) {
                          console.warn('Error resetting Firestore client:', resetError);
                        }
                      });
                  });
                })
                .catch(tokenError => {
                  console.warn('Token refresh failed:', tokenError);
                });
            } catch (error) {
              console.error('Error during reconnection attempt:', error);
            }
          }
        });
      } catch (resetError) {
        console.error('Failed to perform aggressive reset:', resetError);
      }
    } else if (error.code === 'resource-exhausted') {
      console.error('You have exceeded your Firestore quota. Please check your Firebase billing plan.');
    } else if (error.code === 'unauthenticated' || error.message?.includes('400')) {
      console.error('Authentication token is invalid or expired. Attempting to refresh token...');
      
      // Try to refresh the token
      if (auth.currentUser) {
        auth.currentUser.getIdToken(true)
          .then(() => {
            console.log('Token refreshed successfully after unauthenticated error');
            // Reset Firestore client
            return resetFirestoreConnection();
          })
          .then(() => {
            console.log('Firestore connection reset after token refresh');
          })
          .catch(refreshError => {
            console.error('Failed to refresh token after unauthenticated error:', refreshError);
          });
      } else {
        console.error('No current user to refresh token for');
      }
    }
  }
}, 3000);

// Initialize Analytics - only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Export the app instance
export default app;
