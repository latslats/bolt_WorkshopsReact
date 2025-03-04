import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import WorkshopDetail from '../components/workshops/WorkshopDetail';
import { Workshop } from '../types';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workshops, loading, error } = useSelector((state: RootState) => state.workshops);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  
  useEffect(() => {
    if (id && workshops.length > 0) {
      const foundWorkshop = workshops.find(w => w.id === id);
      if (foundWorkshop) {
        setWorkshop(foundWorkshop);
      }
    }
  }, [id, workshops]);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading workshop details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!workshop) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Workshop Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The workshop you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/workshops')}>
          Back to Workshops
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/workshops')}
        >
          ← Back to Workshops
        </Button>
        
        <WorkshopDetail workshop={workshop} />
      </motion.div>
    </div>
  );
};

export default WorkshopDetailPage;
