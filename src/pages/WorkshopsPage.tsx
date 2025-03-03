import React from 'react';
import Layout from '../components/layout/Layout';
import WorkshopCard from '../components/workshops/WorkshopCard';
import WorkshopFilters from '../components/workshops/WorkshopFilters';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWorkshops } from '../hooks/useWorkshops';
import { motion } from 'framer-motion';

const WorkshopsPage: React.FC = () => {
  const { filteredWorkshops, loading, error } = useSelector((state: RootState) => state.workshops);
  
  // Load workshops data
  useWorkshops();
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading workshops...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No workshops found matching your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <WorkshopCard workshop={workshop} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkshopsPage;
