import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { Workshop } from '../../types';
import { useDispatch } from 'react-redux';
import { registerForWorkshop } from '../../store/slices/workshopsSlice';

interface WorkshopCardProps {
  workshop: Workshop;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Memoize the navigation handler
  const handleClick = useCallback(() => {
    navigate(`/workshops/${workshop.id}`);
  }, [navigate, workshop.id]);
  
  // Memoize the registration handler
  const handleRegister = useCallback(() => {
    dispatch(registerForWorkshop(workshop.id));
  }, [dispatch, workshop.id]);
  
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
    const searchTerm = workshop.tags && workshop.tags.length > 0 
      ? workshop.tags[0] 
      : workshop.title || 'coding';
    return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(searchTerm)}`;
  }, [workshop.tags, workshop.title]);
  
  // Memoize the image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If image fails to load, use a fallback
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    const fallbackTerm = workshop.level ? workshop.level.toLowerCase() : 'workshop';
    target.src = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(fallbackTerm)}`;
  }, [workshop.level]);
  
  // Memoize the tags rendering
  const tagsElement = useMemo(() => (
    <div className="flex flex-wrap gap-1">
      {workshop.tags && workshop.tags.length > 0 ? (
        workshop.tags.map((tag, index) => (
          <span key={index} className="inline-block bg-white shadow-sm text-forest-green px-2 py-0.5 text-xs rounded-full">
            {tag}
          </span>
        ))
      ) : (
        <span className="inline-block bg-white shadow-sm text-forest-green px-2 py-0.5 text-xs rounded-full">
          Workshop
        </span>
      )}
    </div>
  ), [workshop.tags]);
  
  // Format the date once
  const formattedDate = useMemo(() => 
    new Date(workshop.date).toLocaleDateString(),
    [workshop.date]
  );
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Workshop Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={workshop.imageUrl || 'https://source.unsplash.com/random/800x600/?workshop'} 
          alt={workshop.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://source.unsplash.com/random/800x600/?workshop';
          }}
        />
        <div className="absolute top-0 right-0 p-2">
          <span className="bg-lemon-yellow/90 text-charcoal dark:text-charcoal px-2 py-1 text-xs font-medium rounded-full">
            {workshop.level}
          </span>
        </div>
      </div>
      
      {/* Workshop Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-forest-green dark:text-moss-green mb-2 line-clamp-2">{workshop.title}</h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{workshop.description}</p>
        
        <div className="mt-auto space-y-3">
          {/* Workshop Details */}
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{workshop.sessions} sessions</span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {workshop.tags && workshop.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="bg-moss-green/20 text-forest-green dark:bg-moss-green/30 dark:text-moss-green px-2 py-0.5 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {workshop.tags && workshop.tags.length > 3 && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">+{workshop.tags.length - 3} more</span>
            )}
          </div>
          
          {/* Registration Status */}
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
              <span>Available Spots</span>
              <span className="font-medium">{workshop.capacity - workshop.registered} / {workshop.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  workshop.registered >= workshop.capacity 
                    ? 'bg-red-500' 
                    : workshop.registered >= workshop.capacity * 0.8 
                      ? 'bg-yellow-500' 
                      : 'bg-forest-green'
                }`}
                style={{ width: `${(workshop.registered / workshop.capacity) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            className={`w-full mt-3 ${
              workshop.registered >= workshop.capacity 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-forest-green hover:bg-spring-garden'
            } text-white`}
            disabled={workshop.registered >= workshop.capacity}
            onClick={(e) => {
              e.stopPropagation();
              handleRegister();
            }}
          >
            {workshop.registered >= workshop.capacity ? 'Workshop Full' : 'Register Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(WorkshopCard);

