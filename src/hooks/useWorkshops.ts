import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { setWorkshops, setLoading, setError } from '../store/slices/workshopsSlice';
import { Workshop } from '../types';

export const useWorkshops = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchWorkshops = async () => {
      dispatch(setLoading(true));
      try {
        const workshopsCollection = collection(db, 'workshops');
        const workshopSnapshot = await getDocs(workshopsCollection);
        const workshopList = workshopSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workshop[];
        
        dispatch(setWorkshops(workshopList));
      } catch (error) {
        console.error('Error fetching workshops:', error);
        dispatch(setError('Failed to fetch workshops. Please try again later.'));
      }
    };

    fetchWorkshops();
  }, [dispatch]);
};

export default useWorkshops;
