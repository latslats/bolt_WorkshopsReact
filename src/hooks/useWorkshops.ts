import { useEffect } from 'react';
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

export const useWorkshops = () => {
  const dispatch = useDispatch();
  const { workshops, filteredWorkshops, loading, error, filters } = useSelector(
    (state: RootState) => state.workshops
  );

  useEffect(() => {
    const fetchWorkshops = async () => {
      dispatch(setLoading(true));
      try {
        // Check if we're using mock data based on environment variable
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        
        let workshopsData;
        if (useMockData) {
          // Use mock data
          workshopsData = mockWorkshops;
        } else {
          // Fetch from Firebase
          workshopsData = await getWorkshops();
        }
        
        dispatch(setWorkshops(workshopsData));
      } catch (err) {
        console.error('Error fetching workshops:', err);
        dispatch(setError('Failed to fetch workshops. Please try again later.'));
      }
    };

    fetchWorkshops();
  }, [dispatch]);

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
