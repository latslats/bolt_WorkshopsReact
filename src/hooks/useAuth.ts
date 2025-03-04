import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setUser, setLoading } from '../store/slices/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';
import { getCurrentUserData, isUserAdmin } from '../services/firebaseService';
import { RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setLoading(true));
    
    // Check if we're using mock data
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Use mock data for local development
      const loadMockUser = async () => {
        try {
          const userData = await getCurrentUserData();
          if (userData) {
            dispatch(setUser(userData));
          } else {
            dispatch(setUser(null));
          }
        } catch (error) {
          console.error('Error loading mock user:', error);
          dispatch(setUser(null));
        } finally {
          dispatch(setLoading(false));
        }
      };
      
      loadMockUser();
      return;
    }
    
    // Use Firebase Auth for production
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          // Check if user is admin
          const admin = await isUserAdmin(firebaseUser.email || '');
          
          const userData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: admin ? 'admin' : 'student',
            ...(userDoc.exists() ? userDoc.data() as Partial<User> : {}),
          };
          
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'student',
          }));
        }
      } else {
        dispatch(setUser(null));
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { user, isAuthenticated, loading, error };
};

export default useAuth;
