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
        console.log('Firestore connection not active, waiting before document creation');
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      // Check if user is admin
      const isAdmin = await isUserAdmin(firebaseUser.email || '');
      console.log('User admin status during document update:', isAdmin);
      
      // Basic user data from Firebase Auth
      const userData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL,
        lastLogin: serverTimestamp(),
        // Ensure role is set correctly
        role: isAdmin ? 'admin' : (user?.role || 'student'),
        // Only set these fields if they don't exist yet
        // to avoid overwriting existing data
        ...(!user && {
          registeredWorkshops: [],
          completedWorkshops: [],
          createdAt: serverTimestamp(),
        })
      };
      
      // Use merge: true to only update the specified fields
      await setDoc(userRef, userData, { merge: true });
      console.log('User document created/updated in Firestore with role:', userData.role);
    } catch (error: any) {
      console.error('Error creating/updating user in Firestore:', error);
      
      // Check for specific 400 errors related to WebChannelConnection
      if (error.code === 'firestore/invalid-argument' || 
          error.message?.includes('400') || 
          error.message?.includes('WebChannelConnection')) {
        console.warn('Detected potential Firestore connection issue, will retry');
        
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          // Try to get user data directly
          const userData = await getCurrentUserData();
          if (userData) {
            console.log('Successfully retrieved user data after connection issue');
            dispatch(setUser(userData));
          }
        } catch (retryError) {
          console.error('Error during retry after connection issue:', retryError);
        }
      }
    }
  };

  useEffect(() => {
    console.log('useAuth hook initializing');
    dispatch(setLoading(true));
    dispatch(clearError());
    
    // Use Firebase Auth
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
          
          // First, ensure user document exists in Firestore
          await createOrUpdateUserDoc(firebaseUser);
          
          // Get complete user data from Firestore
          console.log('User is authenticated, fetching user data from Firestore');
          const userData = await getCurrentUserData();
          
          if (userData) {
            console.log('User data found in Firestore:', userData.id, 'with role:', userData.role);
            
            // Double-check admin status to ensure it's correct
            if (userData.email) {
              const isAdmin = await isUserAdmin(userData.email);
              if (isAdmin && userData.role !== 'admin') {
                console.log('User is admin but role is not set correctly, updating');
                userData.role = 'admin';
              }
            }
            
            dispatch(setUser(userData));
            
            // Setup periodic token refresh to prevent 400 errors
            const tokenRefreshInterval = setInterval(async () => {
              console.log('Performing periodic token refresh');
              await refreshAuthToken();
            }, 30 * 60 * 1000); // Refresh every 30 minutes
            
            // Clear interval on component unmount
            return () => {
              clearInterval(tokenRefreshInterval);
            };
          } else {
            console.log('No user data found in Firestore, creating basic user object');
            // If no user data in Firestore, create basic user object
            const admin = await isUserAdmin(firebaseUser.email || '');
            console.log('Admin check for basic user:', admin);
            
            const basicUserData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: admin ? 'admin' : 'student',
              registeredWorkshops: [],
              completedWorkshops: [],
              photoURL: firebaseUser.photoURL || '',
            };
            
            console.log('Using basic user data with role:', basicUserData.role);
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

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
      
      // Don't reset Firestore connection on unmount as it causes connection issues
      // This was causing the "client is offline" errors
    };
  }, [dispatch]);

  return { user, isAuthenticated, loading, error };
};

export default useAuth;
