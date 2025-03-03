import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BookOpen, CheckCircle, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardStats: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { workshops } = useSelector((state: RootState) => state.workshops);
  
  const registeredCount = user?.registeredWorkshops?.length || 0;
  const completedCount = user?.completedWorkshops?.length || 0;
  
  // Calculate upcoming sessions
  const upcomingSessions = workshops
    .filter(workshop => user?.registeredWorkshops?.includes(workshop.id))
    .flatMap(workshop => workshop.sessions)
    .filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  const stats = [
    {
      name: 'Registered Workshops',
      value: registeredCount,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Completed Workshops',
      value: completedCount,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Upcoming Sessions',
      value: upcomingSessions.length,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      name: 'Hours of Learning',
      value: `${(registeredCount + completedCount) * 3}`,
      icon: Clock,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10 mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
