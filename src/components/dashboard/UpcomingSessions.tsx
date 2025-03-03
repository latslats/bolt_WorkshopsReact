import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UpcomingSessions: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { workshops } = useSelector((state: RootState) => state.workshops);
  
  // Get all sessions from registered workshops
  const registeredWorkshops = workshops.filter(workshop => 
    user?.registeredWorkshops?.includes(workshop.id)
  );
  
  // Flatten and get all sessions
  const allSessions = registeredWorkshops.flatMap(workshop => 
    workshop.sessions.map(session => ({
      ...session,
      workshopId: workshop.id,
      workshopTitle: workshop.title,
    }))
  );
  
  // Filter for upcoming sessions and sort by date
  const upcomingSessions = allSessions
    .filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (upcomingSessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any upcoming sessions. Register for workshops to see your schedule here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>
      
      <div className="space-y-4">
        {upcomingSessions.map((session, index) => {
          const sessionDate = new Date(session.date);
          const formattedDate = format(sessionDate, 'EEEE, MMMM d, yyyy');
          const formattedTime = format(sessionDate, 'h:mm a');
          
          return (
            <motion.div 
              key={session.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <Link 
                    to={`/workshops/${session.workshopId}`}
                    className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    {session.workshopTitle}
                  </Link>
                  <h4 className="text-gray-900 dark:text-white font-medium">{session.title}</h4>
                  <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{formattedDate}</span>
                    <Clock className="h-4 w-4 ml-3 mr-1.5" />
                    <span>{formattedTime} ({session.duration})</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <Link
                    to={`/workshops/${session.workshopId}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {upcomingSessions.length > 0 && (
        <div className="mt-6 text-center">
          <Link 
            to="/dashboard/schedule"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            View Full Schedule →
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;
