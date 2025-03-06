import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, resetFirestoreConnection, firestoreConnectionActive } from '../config/firebase';
import { setUser, setLoading, setError, clearError } from '../store/slices/authSlice';
import { User } from '../types';
import { getCurrentUserData, isUserAdmin, getIdToken, refreshAuthToken, validateSession } from '../services/authService';
import { RootState } from '../store';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  // Helper function to create/update user in Firestore
  const createOrUpdateUserDoc = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      // First ensure we have a fresh token
      await refreshAuthToken();
      
      // Check if Firestore connection is active
      if (!firestoreConnectionActive) {
        console.log('Firestore connection not active, resetting before document creation');
        await resetFirestoreConnection();
      }
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      // Basic user data from Firebase Auth
      const userData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL,
        lastLogin: serverTimestamp(),
        // Only set these fields if they don't exist yet
        // to avoid overwriting existing data
        ...(!user && {
          role: 'student',
          registeredWorkshops: [],
          completedWorkshops: [],
          createdAt: serverTimestamp(),
        })
      };
      
      // Use merge: true to only update the specified fields
      await setDoc(userRef, userData, { merge: true });
      console.log('User document created/updated in Firestore');
    } catch (error: any) {
      console.error('Error creating/updating user in Firestore:', error);
      
      // Check for specific 400 errors related to WebChannelConnection
      if (error.message?.includes('400') || 
          error.message?.includes('WebChannelConnection') || 
          error.message?.includes('Listen stream')) {
        console.warn('Detected WebChannelConnection error, resetting Firestore connection');
        await resetFirestoreConnection();
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Try one more time with a fresh connection
        try {
          await refreshAuthToken();
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            email: firebaseUser.email,
            lastLogin: serverTimestamp(),
          }, { merge: true });
          console.log('Successfully updated user document after connection reset');
        } catch (retryError) {
          console.error('Failed to update user document after connection reset:', retryError);
        }
      } else {
        // For other errors, just reset the connection
        await resetFirestoreConnection();
      }
      // Don't throw - we still want auth to work even if Firestore fails
    }
  };

  useEffect(() => {
    console.log('useAuth hook initializing');
    dispatch(setLoading(true));
    dispatch(clearError());
    
    // Check if we're using mock data
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    console.log('Using mock data:', useMockData);
    
    if (useMockData) {
      // Use mock data for local development
      const loadMockUser = async () => {
        try {
          console.log('Loading mock user data');
          const userData = await getCurrentUserData();
          if (userData) {
            console.log('Mock user data loaded:', userData);
            dispatch(setUser(userData));
          } else {
            console.log('No mock user data found');
            dispatch(setUser(null));
          }
        } catch (error) {
          console.error('Error loading mock user:', error);
          dispatch(setUser(null));
          dispatch(setError('Failed to load mock user data'));
        } finally {
          dispatch(setLoading(false));
        }
      };
      
      loadMockUser();
      return;
    }
    
    // Use Firebase Auth for production
    console.log('Setting up Firebase auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed, user:', firebaseUser?.uid);
      
      if (firebaseUser) {
        try {
          // Validate session and ensure we have a fresh token
          const isSessionValid = await validateSession();
          if (!isSessionValid) {
            console.warn('Session validation failed, attempting to refresh token');
            await refreshAuthToken();
          }
          
          // Ensure Firestore connection is active
          if (!firestoreConnectionActive) {
            console.log('Firestore connection not active, resetting before proceeding');
            await resetFirestoreConnection();
          }
          
          // First, ensure user document exists in Firestore
          await createOrUpdateUserDoc(firebaseUser);
          
          // Get complete user data from Firestore
          console.log('User is authenticated, fetching user data from Firestore');
          const userData = await getCurrentUserData();
          
          if (userData) {
            console.log('User data found in Firestore:', userData.id);
            dispatch(setUser(userData));
            
            // Setup periodic token refresh to prevent 400 errors
            const tokenRefreshInterval = setInterval(async () => {
              console.log('Performing periodic token refresh');
              await refreshAuthToken();
              
              // Also check Firestore connection status
              if (!firestoreConnectionActive) {
                console.log('Firestore connection not active during periodic check, resetting');
                await resetFirestoreConnection();
              }
            }, 30 * 60 * 1000); // Refresh every 30 minutes (reduced from 45)
            
            // Clear interval on component unmount
            return () => {
              clearInterval(tokenRefreshInterval);
            };
          } else {
            console.log('No user data found in Firestore, creating basic user object');
            // If no user data in Firestore, create basic user object
            const admin = await isUserAdmin(firebaseUser.email || '');
            
            const basicUserData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: admin ? 'admin' : 'student',
              registeredWorkshops: [],
              completedWorkshops: [],
              photoURL: firebaseUser.photoURL || '',
            };
            
            console.log('Using basic user data:', basicUserData);
            dispatch(setUser(basicUserData));
          }
        } catch (error: any) {
          console.error('Error in auth state change handler:', error);
          dispatch(setError(error.message || 'Authentication error'));
          
          // Reset Firestore connection on error
          console.log('Resetting Firestore connection after auth error');
          await resetFirestoreConnection();
          
          // Still set basic user data to avoid complete login failure
          const basicUserData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'student',
            registeredWorkshops: [],
            completedWorkshops: [],
            photoURL: firebaseUser.photoURL || '',
          };
          
          console.log('Using fallback basic user data due to error:', basicUserData);
          dispatch(setUser(basicUserData));
        }
      } else {
        console.log('No authenticated user found');
        dispatch(setUser(null));
      }
      
      dispatch(setLoading(false));
    }, (error: Error) => {
      console.error('Firebase auth state error:', error);
      dispatch(setError('Authentication error: ' + error.message));
      dispatch(setLoading(false));
    });

    // Return cleanup function
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
      
      // Reset Firestore connection on unmount to ensure fresh connections
      console.log('Resetting Firestore connection on unmount');
      resetFirestoreConnection().catch(resetError => {
        console.warn('Error resetting Firestore connection on unmount:', resetError);
      });
    };
  }, [dispatch]);

  return { user, isAuthenticated, loading, error };
};

export default useAuth;
