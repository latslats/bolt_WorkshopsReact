import React, { useMemo } from 'react';
import WorkshopCard from '../components/workshops/WorkshopCard';
import WorkshopFilters from '../components/workshops/WorkshopFilters';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWorkshops } from '../hooks/useWorkshops';
import { motion } from 'framer-motion';

// Memoized workshop card to prevent unnecessary re-renders
const MemoizedWorkshopCard = React.memo(WorkshopCard);

const WorkshopsPage: React.FC = () => {
  const { filteredWorkshops, loading, error } = useSelector((state: RootState) => state.workshops);
  
  // Load workshops data
  useWorkshops();
  
  // Memoize the workshop grid to prevent re-rendering when other parts of the component change
  const workshopGrid = useMemo(() => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading workshops...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    
    if (filteredWorkshops.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No workshops found matching your filters. Try adjusting your search criteria.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkshops.map((workshop) => (
          <motion.div
            key={workshop.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <MemoizedWorkshopCard workshop={workshop} />
          </motion.div>
        ))}
      </div>
    );
  }, [filteredWorkshops, loading, error]);
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Explore Our Workshops
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Discover coding workshops tailored to your interests and skill level.
        </p>
      </motion.div>
      
      <WorkshopFilters />
      
      {workshopGrid}
    </div>
  );
};

export default React.memo(WorkshopsPage);
