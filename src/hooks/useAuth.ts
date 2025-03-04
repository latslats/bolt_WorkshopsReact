import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import { User } from '../types';
import { getCurrentUserData, isUserAdmin } from '../services/authService';
import { RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('useAuth hook initializing');
    dispatch(setLoading(true));
    
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
          console.log('User is authenticated, fetching user data from Firestore');
          // Get user data from Firestore using our service
          const userData = await getCurrentUserData();
          
          if (userData) {
            console.log('User data found in Firestore:', userData);
            dispatch(setUser(userData));
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
            };
            
            console.log('Using basic user data:', basicUserData);
            dispatch(setUser(basicUserData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(setError('Failed to fetch user data'));
          
          // Create basic user object on error
          const basicUserData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'student',
            registeredWorkshops: [],
            completedWorkshops: [],
          };
          
          console.log('Using fallback basic user data due to error:', basicUserData);
          dispatch(setUser(basicUserData));
        }
      } else {
        console.log('No authenticated user found');
        dispatch(setUser(null));
      }
      
      dispatch(setLoading(false));
    }, (error) => {
      console.error('Firebase auth state error:', error);
      dispatch(setError('Authentication error: ' + error.message));
      dispatch(setLoading(false));
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [dispatch]);

  return { user, isAuthenticated, loading, error };
};

export default useAuth;
