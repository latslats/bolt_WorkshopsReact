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
    experimentalAutoDetectLongPolling: true,
  });
  
  console.log('Firestore initialized with modern cache configuration');
} catch (firestoreInitError) {
  console.error('Error initializing Firestore with modern options:', firestoreInitError);
  console.log('Falling back to standard Firestore initialization with legacy persistence');
  
  // Fall back to standard initialization
  db = getFirestore(app);
  
  // Try to enable basic persistence as fallback
  try {
    // Try multi-tab persistence first
    enableMultiTabIndexedDbPersistence(db)
      .then(() => console.log('Multi-tab persistence enabled successfully'))
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multi-tab persistence not available - falling back to single-tab persistence');
          // Fall back to single-tab persistence
          enableIndexedDbPersistence(db)
            .then(() => console.log('Single-tab persistence enabled successfully'))
            .catch(e => console.warn('Single-tab persistence also failed:', e));
        } else {
          console.warn('Firestore persistence could not be enabled:', err);
        }
      });
  } catch (persistenceError) {
    console.error('Error setting up persistence:', persistenceError);
  }
}

// Test Firestore connectivity with better error handling
setTimeout(async () => {
  try {
    const testCollectionName = 'system_health_checks';
    // We'll just import what we need here to avoid reference issues
    const { collection, doc, getDoc } = await import('firebase/firestore');
    const healthRef = doc(collection(db, testCollectionName), 'connection_test');
    await getDoc(healthRef);
    console.log('✅ Firestore connection test successful');
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error.message);
    
    // Check for specific error types and provide more helpful messages
    if (error.code === 'permission-denied') {
      console.error('This looks like a Firestore security rules issue - check your rules configuration');
    } else if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.error('Network appears to be offline or Firestore is unavailable. Will retry when online.');
      
      // Add an online listener to retry when connection is restored
      window.addEventListener('online', () => {
        console.log('🔄 Network connection restored, attempting to reconnect to Firestore');
        // Import needed to avoid circular dependencies
        import('./firebase').then(({ db }) => {
          const { collection, doc, getDoc } = require('firebase/firestore');
          const healthRef = doc(collection(db, 'system_health_checks'), 'connection_test');
          getDoc(healthRef)
            .then(() => console.log('✅ Firestore reconnection successful'))
            .catch((e: Error) => console.error('❌ Firestore reconnection failed:', e));
        });
      });
    } else if (error.code === 'resource-exhausted') {
      console.error('You have exceeded your Firestore quota. Please check your Firebase billing plan.');
    } else if (error.code === 'unauthenticated') {
      console.error('Authentication token is invalid or expired. Try signing out and back in.');
    }
  }
}, 3000);

// Initialize Analytics - only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Export the app instance
export default app;
