import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Tag, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Workshop } from '../../types';

interface WorkshopCardProps {
  workshop: Workshop;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const navigate = useNavigate();
  
  // Memoize the navigation handler
  const handleClick = useCallback(() => {
    navigate(`/workshops/${workshop.id}`);
  }, [navigate, workshop.id]);
  
  // Calculate percentage of spots filled - memoize this calculation
  const percentFilled = useMemo(() => 
    (workshop.registered / workshop.capacity) * 100,
    [workshop.registered, workshop.capacity]
  );
  
  // Determine status color - memoize this calculation
  const { statusColor, statusText } = useMemo(() => {
    let color = 'bg-spring-garden';
    let text = 'Available';
    if (percentFilled >= 90) {
      color = 'bg-red-500';
      text = 'Almost Full';
    } else if (percentFilled >= 70) {
      color = 'bg-yellow-500';
      text = 'Filling Up';
    }
    return { statusColor: color, statusText: text };
  }, [percentFilled]);
  
  // Generate a random gradient for the card based on the workshop level - memoize this
  const gradient = useMemo(() => {
    const gradients = {
      'Beginner': 'from-spring-garden/20 to-lemon-yellow/20',
      'Intermediate': 'from-forest-green/20 to-spring-garden/20',
      'Advanced': 'from-moss-green/20 to-forest-green/20',
    };
    return gradients[workshop.level as keyof typeof gradients] || 'from-spring-garden/20 to-lemon-yellow/20';
  }, [workshop.level]);
  
  // Generate a fallback image URL based on the workshop title or tags
  const getFallbackImageUrl = useCallback(() => {
    const searchTerm = workshop.tags[0] || 'coding';
    return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(searchTerm)}`;
  }, [workshop.tags]);
  
  // Memoize the image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If image fails to load, use a fallback
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.src = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(workshop.level.toLowerCase())}`;
  }, [workshop.level]);
  
  // Memoize the tags rendering
  const tagsElement = useMemo(() => (
    <div className="flex flex-wrap gap-1">
      {workshop.tags.map((tag, index) => (
        <span key={index} className="inline-block bg-white shadow-sm text-forest-green px-2 py-0.5 text-xs rounded-full">
          {tag}
        </span>
      ))}
    </div>
  ), [workshop.tags]);
  
  // Format the date once
  const formattedDate = useMemo(() => 
    new Date(workshop.date).toLocaleDateString(),
    [workshop.date]
  );
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br border-0 shadow-lg">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 z-0`}></div>
        <img 
          src={workshop.imageUrl || getFallbackImageUrl()} 
          alt={workshop.title} 
          className="w-full h-48 object-cover relative z-10"
          onError={handleImageError}
          loading="lazy" // Add lazy loading for images
        />
        <div className="absolute top-0 right-0 m-3 px-3 py-1 bg-white shadow-md text-forest-green text-xs font-bold rounded-full z-20">
          {workshop.level}
        </div>
      </div>
      
      <CardContent className="flex-grow relative z-10 pt-6">
        <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-2">{workshop.title}</h3>
        <p className="text-charcoal dark:text-white-linen mb-4 line-clamp-2">{workshop.description}</p>
        
        <div className="space-y-3 text-sm text-charcoal/80 dark:text-white-linen/80">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-green/10 mr-3">
              <Calendar className="h-4 w-4 text-forest-green" />
            </div>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-green/10 mr-3">
              <Clock className="h-4 w-4 text-forest-green" />
            </div>
            <span>{workshop.sessions} sessions</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-green/10 mr-3">
              <Users className="h-4 w-4 text-forest-green" />
            </div>
            <span>{workshop.registered} / {workshop.capacity} participants</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-green/10 mr-3 self-start">
              <Tag className="h-4 w-4 text-forest-green" />
            </div>
            {tagsElement}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center bg-white/80 backdrop-blur-sm border-t border-gray-100 z-10">
        <div className="w-1/2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${statusColor}`}
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-charcoal/70 dark:text-white-linen/70">
            <span className="font-medium">{statusText}:</span> {workshop.capacity - workshop.registered} spots left
          </p>
        </div>
        <Button onClick={handleClick} className="group">
          View Details
          <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(WorkshopCard);
