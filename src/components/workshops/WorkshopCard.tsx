import React from 'react';
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
  
  const handleClick = () => {
    navigate(`/workshops/${workshop.id}`);
  };
  
  // Calculate percentage of spots filled
  const percentFilled = (workshop.registered / workshop.capacity) * 100;
  
  // Determine status color
  let statusColor = 'bg-spring-garden';
  let statusText = 'Available';
  if (percentFilled >= 90) {
    statusColor = 'bg-red-500';
    statusText = 'Almost Full';
  } else if (percentFilled >= 70) {
    statusColor = 'bg-yellow-500';
    statusText = 'Filling Up';
  }
  
  // Generate a random gradient for the card based on the workshop level
  const gradients = {
    'Beginner': 'from-spring-garden/20 to-lemon-yellow/20',
    'Intermediate': 'from-forest-green/20 to-spring-garden/20',
    'Advanced': 'from-moss-green/20 to-forest-green/20',
  };
  
  const gradient = gradients[workshop.level as keyof typeof gradients] || 'from-spring-garden/20 to-lemon-yellow/20';
  
  // Generate a fallback image URL based on the workshop title or tags
  const getFallbackImageUrl = () => {
    const searchTerm = workshop.tags[0] || 'coding';
    return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(searchTerm)}`;
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br border-0 shadow-lg">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 z-0`}></div>
        <img 
          src={workshop.imageUrl || getFallbackImageUrl()} 
          alt={workshop.title} 
          className="w-full h-48 object-cover relative z-10"
          onError={(e) => {
            // If image fails to load, use a fallback
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(workshop.level.toLowerCase())}`;
          }}
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
            <span>{new Date(workshop.date).toLocaleDateString()}</span>
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
            <div className="flex flex-wrap gap-1">
              {workshop.tags.map((tag, index) => (
                <span key={index} className="inline-block bg-white shadow-sm text-forest-green px-2 py-0.5 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
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

export default WorkshopCard;
