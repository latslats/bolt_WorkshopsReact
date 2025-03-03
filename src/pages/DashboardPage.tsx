import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Layout from '../components/layout/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import RegisteredWorkshops from '../components/dashboard/RegisteredWorkshops';
import { useWorkshops } from '../hooks/useWorkshops';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Load workshops data
  useWorkshops();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress and manage your workshops from your personal dashboard.
          </p>
        </motion.div>
        
        <DashboardStats />
        <UpcomingSessions />
        <RegisteredWorkshops />
      </div>
    </Layout>
  );
};

export default DashboardPage;
