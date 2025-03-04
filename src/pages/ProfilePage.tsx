import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Your Profile
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Personal Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Your account details and preferences.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {user?.name}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {user?.email}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Account type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {user?.isAdmin ? 'Administrator' : 'Standard User'}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Member since
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 flex space-x-4">
          <Button>
            Edit Profile
          </Button>
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
            Change Password
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
