import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import Tabs from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';

const AdminPage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { workshops } = useSelector((state: RootState) => state.workshops);
  const [activeTab, setActiveTab] = useState('users');
  
  // Mock users data (in a real app, this would come from the store)
  const users = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
  ];
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, workshops, and system settings.
        </p>
      </motion.div>
      
      <Tabs
        tabs={[
          { id: 'users', label: 'Users' },
          { id: 'workshops', label: 'Workshops' },
          { id: 'settings', label: 'Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      <div className="mt-6">
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
              <Button>Add New User</Button>
            </div>
            <div className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'workshops' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workshop Management</h2>
              <Button>Add New Workshop</Button>
            </div>
            <div className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshops.map((workshop) => (
                    <TableRow key={workshop.id}>
                      <TableCell>{workshop.title}</TableCell>
                      <TableCell>{workshop.instructor}</TableCell>
                      <TableCell>{workshop.category}</TableCell>
                      <TableCell>{new Date(workshop.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Settings</h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Site Configuration</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      className="shadow-sm focus:ring-forest-green focus:border-forest-green block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                      defaultValue="Bark & Build Lab"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="shadow-sm focus:ring-forest-green focus:border-forest-green block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                      defaultValue="contact@barkbuildlab.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Registration Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allow-registration"
                        name="allow-registration"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-forest-green h-4 w-4 text-forest-green border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allow-registration" className="font-medium text-gray-700 dark:text-gray-300">
                        Allow new user registration
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">
                        If disabled, only admins can create new accounts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email-verification"
                        name="email-verification"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-forest-green h-4 w-4 text-forest-green border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email-verification" className="font-medium text-gray-700 dark:text-gray-300">
                        Require email verification
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">
                        Users must verify their email before accessing the platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Settings</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
