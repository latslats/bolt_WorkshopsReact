import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Workshop } from '../../types';
import { format } from 'date-fns';
import { Calendar, Clock, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface WorkshopDetailProps {
  workshop: Workshop;
}

const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ workshop }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'materials' | 'discussion'>('overview');
  const dispatch = useDispatch();
  
  const isRegistered = user?.registeredWorkshops?.includes(workshop.id);
  const isCompleted = user?.completedWorkshops?.includes(workshop.id);
  const spotsLeft = workshop.capacity - workshop.registeredUsers;
  const isFull = spotsLeft <= 0;
  
  const startDate = new Date(workshop.startDate);
  const endDate = new Date(workshop.endDate);
  const formattedStartDate = format(startDate, 'MMMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMMM d, yyyy');
  
  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to register for workshops');
      return;
    }
    
    if (isFull) {
      toast.error('This workshop is full');
      return;
    }
    
    setRegistering(true);
    
    try {
      // Update user document
      const userRef = doc(db, 'users', user!.id);
      await updateDoc(userRef, {
        registeredWorkshops: arrayUnion(workshop.id)
      });
      
      // Update workshop document
      const workshopRef = doc(db, 'workshops', workshop.id);
      const workshopDoc = await getDoc(workshopRef);
      const currentRegistered = workshopDoc.data()?.registeredUsers || 0;
      
      await updateDoc(workshopRef, {
        registeredUsers: currentRegistered + 1
      });
      
      toast.success('Successfully registered for the workshop!');
      
      // Update local state
      // This would typically be handled by re-fetching the user data
      // or updating the Redux store
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for the workshop');
    } finally {
      setRegistering(false);
    }
  };
  
  const difficultyColor = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={workshop.imageUrl} 
          alt={workshop.title} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-3xl font-bold mb-2">{workshop.title}</h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor[workshop.difficulty]}`}>
                {workshop.difficulty}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {workshop.topic}
              </span>
            </div>
            <p className="text-lg max-w-2xl">{workshop.shortDescription}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
              <span>{formattedStartDate} - {formattedEndDate}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-5 w-5 mr-2 text-indigo-500" />
              <span>{workshop.sessions.length} sessions</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              <span>{isFull ? 'Full' : `${spotsLeft} spots left`}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            {isRegistered ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Registered</span>
              </div>
            ) : isCompleted ? (
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Completed</span>
              </div>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={registering || isFull || !isAuthenticated}
              >
                {registering ? 'Registering...' : isFull ? 'Workshop Full' : 'Register Now'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'materials'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Materials
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discussion'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Discussion
            </button>
          </nav>
        </div>
        
        <div>
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4">About this Workshop</h3>
                <p className="mb-6">{workshop.description}</p>
                
                <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
                <ul className="list-disc pl-5 mb-6">
                  {workshop.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="mb-2">{prerequisite}</li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                <div className="flex items-start mb-6">
                  <img 
                    src={workshop.instructor.photoURL} 
                    alt={workshop.instructor.name} 
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-medium">{workshop.instructor.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{workshop.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'sessions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">Workshop Sessions</h3>
              <div className="space-y-6">
                {workshop.sessions.map((session, index) => {
                  const sessionDate = new Date(session.date);
                  const formattedSessionDate = format(sessionDate, 'MMMM d, yyyy');
                  
                  return (
                    <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium">Session {index + 1}: {session.title}</h4>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formattedSessionDate}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          <span>{session.duration}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{session.description}</p>
                      
                      {isRegistered && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            View Session Content
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'materials' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">Workshop Materials</h3>
              
              {isRegistered ? (
                <div className="space-y-4">
                  {workshop.materials.map((material, index) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
                      <span className="text-gray-800 dark:text-gray-200">{material}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Registration required</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                      Please register for this workshop to access the materials.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'discussion' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">Discussion</h3>
              
              {isRegistered ? (
                <div>
                  <div className="mb-6">
                    <textarea
                      placeholder="Ask a question or share your thoughts..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <Button>Post Comment</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-gray-500 dark:text-gray-400 text-center italic">No comments yet. Be the first to start the discussion!</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Registration required</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                      Please register for this workshop to participate in the discussion.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
