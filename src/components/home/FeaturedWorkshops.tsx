import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Workshop } from '../../types';
import WorkshopCard from '../workshops/WorkshopCard';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useWorkshops } from '../../hooks/useWorkshops';

const FeaturedWorkshops: React.FC = () => {
  // Get workshops from Redux store
  const { workshops, loading, error } = useSelector((state: RootState) => state.workshops);
  
  // Use the useWorkshops hook to ensure data is loaded
  useWorkshops();
  
  // For debugging
  console.log('Workshops in store:', workshops);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  
  // Filter for featured workshops (for example, the 3 most recent)
  // Create a new array with slice() before sorting to avoid modifying the original array
  const featuredWorkshops = workshops.length > 0 
    ? [...workshops]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : []; // Empty array if no workshops available
  
  // For debugging
  console.log('Featured workshops:', featuredWorkshops);
  
  // If no workshops are available or still loading, show loading state
  if (loading) {
    return (
      <section className="py-12 bg-white-linen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-forest-green mb-8">Featured Workshops</h2>
          <div className="flex justify-center">
            <p>Loading workshops...</p>
          </div>
        </div>
      </section>
    );
  }
  
  // If there's an error, show error message
  if (error) {
    return (
      <section className="py-12 bg-white-linen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-forest-green mb-8">Featured Workshops</h2>
          <div className="flex justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  // If no workshops are available, show message
  if (featuredWorkshops.length === 0) {
    return (
      <section className="py-12 bg-white-linen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-forest-green mb-8">Featured Workshops</h2>
          <div className="flex justify-center">
            <p>No workshops available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-forest-green/5 to-forest-green/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-spring-garden/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-lemon-yellow/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Featured Workshops
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-charcoal sm:mt-4">
            Check out our most popular upcoming workshops
          </p>
        </motion.div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredWorkshops.map((workshop: Workshop, index: number) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <WorkshopCard workshop={workshop} />
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/workshops">
            <Button size="lg" className="group">
              View All Workshops
              <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedWorkshops;
