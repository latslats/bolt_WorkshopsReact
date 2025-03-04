import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
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
  if (!isAuthenticated || user?.role !== 'admin') {
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="workshops">Workshops</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          {/* Users tab content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>
            <Table>
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
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="mr-2">Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="workshops">
          {/* Workshops tab content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <h3 className="text-xl font-semibold mb-4">Workshop Management</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workshops.map(workshop => (
                  <TableRow key={workshop.id}>
                    <TableCell>{workshop.title}</TableCell>
                    <TableCell>{workshop.level}</TableCell>
                    <TableCell>{workshop.instructor}</TableCell>
                    <TableCell>{new Date(workshop.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="mr-2">Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          {/* Settings tab content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <h3 className="text-xl font-semibold mb-4">System Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Site Maintenance</h4>
                <div className="flex items-center">
                  <input type="checkbox" id="maintenance" className="mr-2" />
                  <label htmlFor="maintenance">Enable maintenance mode</label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Registration</h4>
                <div className="flex items-center">
                  <input type="checkbox" id="registration" className="mr-2" defaultChecked />
                  <label htmlFor="registration">Allow new user registration</label>
                </div>
              </div>
              
              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
