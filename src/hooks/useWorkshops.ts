import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchWorkshopsStart, 
  fetchWorkshopsSuccess, 
  fetchWorkshopsFailure 
} from '../store/slices/workshopsSlice';
import { getWorkshops } from '../utils/mockData';

export const useWorkshops = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        dispatch(fetchWorkshopsStart());
        
        // In a real app, this would be an API call
        // For now, we're using mock data from localStorage
        const workshops = getWorkshops();
        
        // Simulate network delay
        setTimeout(() => {
          dispatch(fetchWorkshopsSuccess(workshops));
        }, 500);
      } catch (error) {
        dispatch(fetchWorkshopsFailure(error instanceof Error ? error.message : 'Failed to fetch workshops'));
      }
    };
    
    loadWorkshops();
  }, [dispatch]);
};
