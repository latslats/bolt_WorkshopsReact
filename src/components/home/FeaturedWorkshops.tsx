import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Workshop } from '../../types';
import WorkshopCard from '../workshops/WorkshopCard';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { mockWorkshops } from '../../utils/mockData';
import { setWorkshops } from '../../store/slices/workshopsSlice';
import { useWorkshops } from '../../hooks/useWorkshops';

const FeaturedWorkshops: React.FC = () => {
  const dispatch = useDispatch();
  // Get workshops from Redux store
  const { workshops, loading, error } = useSelector((state: RootState) => state.workshops);
  
  // Use the useWorkshops hook to ensure data is loaded
  useWorkshops();
  
  // If no workshops are available in the store, use mock data as fallback
  useEffect(() => {
    if (workshops.length === 0 && !loading) {
      console.log('No workshops found in store, using mock data as fallback');
      dispatch(setWorkshops(mockWorkshops));
    }
  }, [workshops, loading, dispatch]);
  
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
    : mockWorkshops.slice(0, 3); // Use mock data as fallback
  
  // For debugging
  console.log('Featured workshops:', featuredWorkshops);
  
  // Sample workshop data for testing
  const sampleWorkshops: Workshop[] = [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React and build your first component.',
      instructor: 'Bob Johnson',
      date: '2023-10-15',
      sessions: 4,
      level: 'Beginner',
      tags: ['React', 'JavaScript', 'Frontend'],
      capacity: 20,
      registered: 15,
      materials: ['React Docs', 'CodeSandbox'],
      imageUrl: 'https://source.unsplash.com/random/800x600/?react'
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      description: 'Deep dive into TypeScript features and advanced type systems.',
      instructor: 'Alice Chen',
      date: '2023-10-22',
      sessions: 3,
      level: 'Advanced',
      tags: ['TypeScript', 'JavaScript', 'Programming'],
      capacity: 15,
      registered: 10,
      materials: ['TypeScript Handbook', 'GitHub Repo'],
      imageUrl: 'https://source.unsplash.com/random/800x600/?typescript'
    },
    {
      id: '3',
      title: 'Firebase Fundamentals',
      description: 'Learn how to integrate Firebase into your web applications.',
      instructor: 'David Kim',
      date: '2023-11-05',
      sessions: 2,
      level: 'Intermediate',
      tags: ['Firebase', 'Backend', 'Database'],
      capacity: 25,
      registered: 18,
      materials: ['Firebase Documentation', 'Sample Code'],
      imageUrl: 'https://source.unsplash.com/random/800x600/?firebase'
    }
  ];
  
  // Use sample data if no workshops are available
  const workshopsToDisplay = featuredWorkshops.length > 0 ? featuredWorkshops : sampleWorkshops;
  
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
        
        {loading ? (
          <div className="mt-12 text-center py-12">
            <p className="text-lg text-charcoal">Loading workshops...</p>
          </div>
        ) : error ? (
          <div className="mt-12 text-center py-12">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {workshopsToDisplay.map((workshop: Workshop, index: number) => (
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
        )}
        
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
