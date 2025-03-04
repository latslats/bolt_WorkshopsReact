import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Tag } from 'lucide-react';
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
  if (percentFilled >= 90) {
    statusColor = 'bg-red-500';
  } else if (percentFilled >= 70) {
    statusColor = 'bg-yellow-500';
  }
  
  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img 
          src={workshop.imageUrl} 
          alt={workshop.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-forest-green text-white-linen text-xs font-bold rounded">
          {workshop.level}
        </div>
      </div>
      
      <CardContent className="flex-grow">
        <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-2">{workshop.title}</h3>
        <p className="text-charcoal dark:text-white-linen mb-4 line-clamp-2">{workshop.description}</p>
        
        <div className="space-y-2 text-sm text-charcoal/80 dark:text-white-linen/80">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-spring-garden" />
            <span>{new Date(workshop.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-spring-garden" />
            <span>{workshop.duration} hours</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-spring-garden" />
            <span>{workshop.registered} / {workshop.capacity} participants</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-spring-garden" />
            <div className="flex flex-wrap gap-1">
              {workshop.tags.map((tag, index) => (
                <span key={index} className="inline-block bg-moss-green/20 text-forest-green dark:text-moss-green px-2 py-0.5 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="w-1/2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${statusColor}`}
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-charcoal/70 dark:text-white-linen/70">
            {workshop.capacity - workshop.registered} spots left
          </p>
        </div>
        <Button onClick={handleClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkshopCard;
