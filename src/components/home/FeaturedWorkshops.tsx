import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Workshop } from '../../types';
import WorkshopCard from '../workshops/WorkshopCard';
import Button from '../ui/Button';

const FeaturedWorkshops: React.FC = () => {
  // Get workshops from Redux store
  const { workshops } = useSelector((state: RootState) => state.workshops);
  
  // Filter for featured workshops (for example, the 3 most recent)
  // Create a new array with slice() before sorting to avoid modifying the original array
  const featuredWorkshops = [...workshops]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  return (
    <section className="py-12 bg-white-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Featured Workshops
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-charcoal sm:mt-4">
            Check out our most popular upcoming workshops
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredWorkshops.map((workshop: Workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/workshops">
            <Button size="lg">
              View All Workshops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkshops;
