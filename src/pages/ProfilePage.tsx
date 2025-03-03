import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { User, Mail, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
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
          className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Personal details and account settings.
              </p>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 p-6 flex justify-center">
                <div className="text-center">
                  <img
                    className="h-32 w-32 rounded-full mx-auto object-cover"
                    src={user?.photoURL || 'https://via.placeholder.com/128'}
                    alt={user?.name || 'User'}
                  />
                  <div className="mt-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">Member since 2023</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Registered Workshops
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.registeredWorkshops?.length || 0}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Completed Workshops
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user?.completedWorkshops?.length || 0}
                    </dd>
                  </div>
                </dl>
                
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your workshops</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="email-notifications"
                          name="email-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
