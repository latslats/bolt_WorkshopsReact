import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setWorkshops, 
  setLoading, 
  setError,
  filterWorkshops
} from '../store/slices/workshopsSlice';
import { getWorkshops } from '../services/firebaseService';
import { Workshop } from '../types';

// Create a cache outside the hook to persist between renders
const workshopsCache = {
  data: null as Workshop[] | null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
};

export const useWorkshops = () => {
  const dispatch = useDispatch();
  const { workshops, filteredWorkshops, loading, error, filters } = useSelector(
    (state: RootState) => state.workshops
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Skip fetching if we already have workshops in the Redux store
    if (workshops.length > 0 || isInitialized) {
      return;
    }

    const fetchWorkshops = async () => {
      // Check if we already have cached data that's not expired
      const now = Date.now();
      if (workshopsCache.data && (now - workshopsCache.timestamp < workshopsCache.expiryTime)) {
        console.log('Using cached workshop data');
        dispatch(setWorkshops(workshopsCache.data));
        setIsInitialized(true);
        return;
      }

      dispatch(setLoading(true));
      try {
        // Fetch from Firebase
        const workshopsData = await getWorkshops();
        
        if (!workshopsData || workshopsData.length === 0) {
          console.log('No workshops found in Firebase');
          dispatch(setWorkshops([]));
          dispatch(setError('No workshops found. Please create some workshops.'));
        } else {
          // Update the cache
          workshopsCache.data = workshopsData;
          workshopsCache.timestamp = now;
          
          dispatch(setWorkshops(workshopsData));
        }
        setIsInitialized(true);
      } catch (err) {
        console.error('Error fetching workshops:', err);
        dispatch(setWorkshops([]));
        dispatch(setError('Failed to fetch workshops from database. Please try again later.'));
        setIsInitialized(true);
      }
    };

    fetchWorkshops();
  }, [dispatch, workshops.length, isInitialized]);

  const applyFilters = (filterParams: { search?: string; level?: string; tags?: string[] }) => {
    dispatch(filterWorkshops(filterParams));
  };

  return {
    workshops,
    filteredWorkshops,
    loading,
    error,
    filters,
    applyFilters
  };
};
