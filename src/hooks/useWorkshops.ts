import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setWorkshops, 
  setLoading, 
  setError,
  filterWorkshops
} from '../store/slices/workshopsSlice';
import { mockWorkshops } from '../utils/mockData';
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
        // Check if we're using mock data based on environment variable
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        
        let workshopsData;
        if (useMockData) {
          // Use mock data - this should be very fast
          workshopsData = mockWorkshops;
        } else {
          // Fetch from Firebase
          workshopsData = await getWorkshops();
          
          // If no workshops found in Firebase, use mock data as fallback
          if (!workshopsData || workshopsData.length === 0) {
            workshopsData = mockWorkshops;
          }
        }
        
        // Update the cache
        workshopsCache.data = workshopsData;
        workshopsCache.timestamp = now;
        
        dispatch(setWorkshops(workshopsData));
        setIsInitialized(true);
      } catch (err) {
        console.error('Error fetching workshops:', err);
        // Use mock data as fallback in case of error
        dispatch(setWorkshops(mockWorkshops));
        dispatch(setError('Failed to fetch workshops from database. Using sample data instead.'));
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
