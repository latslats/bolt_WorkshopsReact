import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import WorkshopForm from '../components/admin/WorkshopForm';
import ImageUploader from '../components/admin/ImageUploader';
import AttendanceTracker from '../components/admin/AttendanceTracker';
import { Plus, Edit, Trash2, Users, AlertCircle, X } from 'lucide-react';
import { Workshop, User } from '../types';
import { getFirestore, doc, setDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { addWorkshop, updateWorkshop, deleteWorkshop } from '../store/slices/workshopsSlice';
import { getUsers, deleteUser, updateUser, getUserRegistrations, unregisterUserFromWorkshop } from '../services/firebaseService';

const AdminPage: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { workshops } = useSelector((state: RootState) => state.workshops);
  const [activeTab, setActiveTab] = useState('users');
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [showAttendanceTracker, setShowAttendanceTracker] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showUserEditForm, setShowUserEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('Failed to load users. Please try again.');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Handle user edit
  const handleEditUser = async (userId: string) => {
    try {
      setErrorMessage(null);
      const userToEdit = users.find(u => u.id === userId);
      if (userToEdit) {
        setEditingUser(userToEdit);
        setShowUserEditForm(true);
      } else {
        setErrorMessage('User not found.');
      }
    } catch (error) {
      console.error('Error preparing user edit:', error);
      setErrorMessage('Failed to prepare user edit. Please try again.');
    }
  };

  // Handle user edit form submission
  const handleUserEditSubmit = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      await updateUser(editingUser.id, userData);
      
      // Update the user in the local state
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, ...userData } : u
      ));
      
      // Close the form
      setShowUserEditForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage('Failed to update user. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user delete
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      // Get user's registered workshops
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete && userToDelete.registeredWorkshops && userToDelete.registeredWorkshops.length > 0) {
        // Unregister user from all workshops
        for (const workshopId of userToDelete.registeredWorkshops) {
          await unregisterUserFromWorkshop(userId, workshopId);
        }
      }
      
      // Delete the user
      await deleteUser(userId);
      
      // Update the local state to reflect the deletion
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Failed to delete user. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle workshop form submission
  const handleWorkshopSubmit = async (workshopData: Omit<Workshop, 'id'>) => {
    try {
      setErrorMessage(null);
      const db = getFirestore();
      
      // Include the uploaded image URL if available
      const workshopWithImage = {
        ...workshopData,
        imageUrl: uploadedImageUrl || workshopData.imageUrl
      };
      
      if (editingWorkshop) {
        // Update existing workshop
        await setDoc(doc(db, 'workshops', editingWorkshop.id), {
          ...workshopWithImage,
          // Preserve existing registrations and attendance
          registrations: editingWorkshop.registrations || [],
          attendance: editingWorkshop.attendance || []
        }, { merge: true });
        
        // Update Redux state
        dispatch(updateWorkshop({
          ...editingWorkshop,
          ...workshopWithImage,
          registrations: editingWorkshop.registrations || [],
          attendance: editingWorkshop.attendance || []
        }));
        
      } else {
        // Create new workshop
        const workshopRef = await addDoc(collection(db, 'workshops'), {
          ...workshopWithImage,
          registrations: [],
          attendance: []
        });
        
        // Update Redux state
        dispatch(addWorkshop({
          id: workshopRef.id,
          ...workshopWithImage,
          registrations: [],
          attendance: []
        }));
      }
      
      // Reset form state
      setShowWorkshopForm(false);
      setEditingWorkshop(null);
      setUploadedImageUrl('');
      
    } catch (error) {
      console.error('Error saving workshop:', error);
      setErrorMessage(`Failed to save workshop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle workshop deletion
  const handleDeleteWorkshop = async (workshopId: string) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        setErrorMessage(null);
        const db = getFirestore();
        await deleteDoc(doc(db, 'workshops', workshopId));
        
        // Update Redux state
        dispatch(deleteWorkshop(workshopId));
        
      } catch (error) {
        console.error('Error deleting workshop:', error);
        setErrorMessage(`Failed to delete workshop: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Handle opening attendance tracker
  const handleOpenAttendanceTracker = (workshopId: string) => {
    setSelectedWorkshopId(workshopId);
    setShowAttendanceTracker(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-forest-green dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage users, workshops, and system settings.
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <div className="flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span className="block sm:inline">{errorMessage}</span>
            </div>
            <button 
              className="absolute top-0 right-0 p-2"
              onClick={() => setErrorMessage(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-700">
          <TabsTrigger 
            value="users" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-forest-green dark:data-[state=active]:text-moss-green"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="workshops" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-forest-green dark:data-[state=active]:text-moss-green"
          >
            Workshops
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-forest-green dark:data-[state=active]:text-moss-green"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          {/* Users tab content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">User Management</h3>
            {isLoadingUsers ? (
              <div className="text-center py-4">
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4">
                <p>No users found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                  <TableRow>
                    <TableHead className="text-gray-700 dark:text-gray-200">Name</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Email</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Role</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="text-gray-800 dark:text-gray-200">{user.name || 'N/A'}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{user.email}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{user.role || 'user'}</TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Inactive' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mr-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          onClick={() => handleEditUser(user.id)}
                          disabled={isProcessing}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-600 dark:text-red-400 dark:border-red-400"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isProcessing}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="workshops">
          {/* Workshops tab content */}
          {showWorkshopForm ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <WorkshopForm
                    workshop={editingWorkshop || undefined}
                    onSubmit={handleWorkshopSubmit}
                    onCancel={() => {
                      setShowWorkshopForm(false);
                      setEditingWorkshop(null);
                      setErrorMessage(null);
                    }}
                  />
                </div>
                <div>
                  <ImageUploader
                    onImageUploaded={setUploadedImageUrl}
                    currentImageUrl={editingWorkshop?.imageUrl}
                  />
                </div>
              </div>
            </div>
          ) : showAttendanceTracker && selectedWorkshopId ? (
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAttendanceTracker(false);
                  setSelectedWorkshopId(null);
                  setErrorMessage(null);
                }}
                className="mb-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Back to Workshops
              </Button>
              <AttendanceTracker workshopId={selectedWorkshopId} />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Workshop Management</h3>
                <Button 
                  onClick={() => {
                    setShowWorkshopForm(true);
                    setEditingWorkshop(null);
                    setErrorMessage(null);
                  }}
                  className="flex items-center bg-forest-green hover:bg-spring-garden text-white"
                >
                  <Plus size={16} className="mr-1" />
                  Add Workshop
                </Button>
              </div>
              
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                  <TableRow>
                    <TableHead className="text-gray-700 dark:text-gray-200">Title</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Level</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Instructor</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Date</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Registered</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No workshops found. Click "Add Workshop" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    workshops.map(workshop => (
                      <TableRow key={workshop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="text-gray-800 dark:text-gray-200">{workshop.title}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{workshop.level}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{workshop.instructor}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{new Date(workshop.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{workshop.registered} / {workshop.capacity}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setEditingWorkshop(workshop);
                                setShowWorkshopForm(true);
                                setErrorMessage(null);
                              }}
                              title="Edit workshop"
                              className="border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-600 dark:text-red-400 dark:border-red-400"
                              onClick={() => handleDeleteWorkshop(workshop.id)}
                              title="Delete workshop"
                            >
                              <Trash2 size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-400"
                              onClick={() => handleOpenAttendanceTracker(workshop.id)}
                              title="Manage attendance"
                            >
                              <Users size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          {/* Settings tab content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">System Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Site Maintenance</h4>
                <div className="flex items-center">
                  <input type="checkbox" id="maintenance" className="mr-2" />
                  <label htmlFor="maintenance" className="text-gray-800 dark:text-gray-200">Enable maintenance mode</label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Registration</h4>
                <div className="flex items-center">
                  <input type="checkbox" id="registration" className="mr-2" defaultChecked />
                  <label htmlFor="registration" className="text-gray-800 dark:text-gray-200">Allow new user registration</label>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="bg-forest-green hover:bg-spring-garden text-white">Save Settings</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </motion.div>
      
      {/* User Edit Form Modal */}
      {showUserEditForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit User</h3>
              <button 
                onClick={() => {
                  setShowUserEditForm(false);
                  setEditingUser(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData: Partial<User> = {
                name: formData.get('name') as string,
                role: formData.get('role') as 'student' | 'instructor' | 'admin',
                status: formData.get('status') as 'Active' | 'Inactive'
              };
              handleUserEditSubmit(userData);
            }}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingUser.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-forest-green focus:border-forest-green dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editingUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue={editingUser.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-forest-green focus:border-forest-green dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editingUser.status || 'Active'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-forest-green focus:border-forest-green dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUserEditForm(false);
                    setEditingUser(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
