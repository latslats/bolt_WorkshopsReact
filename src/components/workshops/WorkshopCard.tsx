import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, BookOpen } from 'lucide-react';
import Card from '../ui/Card';
import { Workshop } from '../../types';
import { motion } from 'framer-motion';

interface WorkshopCardProps {
  workshop: Workshop;
  isRegistered?: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, isRegistered }) => {
  const difficultyColor = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const startDate = new Date(workshop.startDate);
  const formattedDate = format(startDate, 'MMM d, yyyy');
  
  const spotsLeft = workshop.capacity - workshop.registeredUsers;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img 
          src={workshop.imageUrl} 
          alt={workshop.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor[workshop.difficulty]}`}>
            {workshop.difficulty}
          </span>
        </div>
        {isRegistered && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              Registered
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{workshop.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{workshop.shortDescription}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
            {formattedDate}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
            {isFull ? (
              <span className="text-red-600 dark:text-red-400">Full</span>
            ) : (
              <span>{spotsLeft} spots left</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
            {workshop.sessions.length} sessions
          </div>
        </div>
        
        <Link 
          to={`/workshops/${workshop.id}`}
          className="mt-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-center"
        >
          View Details
        </Link>
      </div>
    </Card>
  );
};

export default WorkshopCard;
