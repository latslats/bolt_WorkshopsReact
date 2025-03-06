import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, Calendar, User, FileText, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatDate } from '../utils/dateUtils';
import { Workshop } from '../types';
import RegisteredUsers from './workshops/RegisteredUsers';
import { useDispatch, useSelector } from 'react-redux';
import { registerForWorkshop } from '../store/slices/workshopsSlice';
import { RootState } from '../store';

const WorkshopDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Get workshops from Redux store
  const { workshops, loading: workshopsLoading } = useSelector((state: RootState) => state.workshops);
  const { user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!workshopsLoading && id) {
      const foundWorkshop = workshops.find(w => w.id === id);
      if (foundWorkshop) {
        setWorkshop(foundWorkshop);
        
        // Check if current user is registered
        if (user && foundWorkshop.registrations && foundWorkshop.registrations.includes(user.id)) {
          setIsRegistered(true);
        }
      } else {
        setError('Workshop not found');
      }
      setLoading(false);
    }
  }, [id, workshops, workshopsLoading, user]);

  const handleRegister = () => {
    if (id) {
      dispatch(registerForWorkshop(id));
      setIsRegistered(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-forest-green dark:text-moss-green" />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Workshop</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-forest-green hover:bg-spring-garden text-white"
          >
            Return to Workshops
          </Button>
        </div>
      ) : workshop ? (
        <>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Workshop Image */}
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-md h-64 md:h-auto">
                <img 
                  src={workshop.imageUrl || 'https://source.unsplash.com/random/800x600/?workshop'} 
                  alt={workshop.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://source.unsplash.com/random/800x600/?workshop';
                  }}
                />
              </div>
              
              {/* Registration Section */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-4">Registration</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Available Spots:</span>
                    <span className="font-medium text-forest-green dark:text-moss-green">
                      {workshop.capacity - workshop.registered} / {workshop.capacity}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-forest-green h-2.5 rounded-full" 
                      style={{ width: `${(workshop.registered / workshop.capacity) * 100}%` }}
                    ></div>
                  </div>
                  
                  <Button
                    onClick={handleRegister}
                    disabled={workshop.registered >= workshop.capacity || isRegistered}
                    className={`w-full ${
                      isRegistered 
                        ? 'bg-moss-green cursor-not-allowed' 
                        : workshop.registered >= workshop.capacity 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-forest-green hover:bg-spring-garden'
                    } text-white`}
                  >
                    {isRegistered 
                      ? 'Already Registered' 
                      : workshop.registered >= workshop.capacity 
                        ? 'Workshop Full' 
                        : 'Register Now'}
                  </Button>
                  
                  {isRegistered && (
                    <p className="text-sm text-moss-green dark:text-moss-green/80 text-center mt-2">
                      You're all set! We'll send you a reminder before the workshop.
                    </p>
                  )}
                  
                  {/* Registered Users Section */}
                  {workshop.registrations && workshop.registrations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-forest-green dark:text-moss-green mb-3">
                        Registered Participants
                      </h4>
                      <RegisteredUsers userIds={workshop.registrations} maxDisplay={5} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Workshop Details */}
            <div className="md:w-2/3">
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="p-0 h-auto text-gray-500 dark:text-gray-400 hover:text-forest-green dark:hover:text-moss-green hover:bg-transparent"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back to Workshops
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold text-forest-green dark:text-moss-green mb-2">{workshop.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {workshop.tags && workshop.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-moss-green/20 text-forest-green dark:bg-moss-green/30 dark:text-moss-green px-3 py-1 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                <span className="bg-lemon-yellow/20 text-charcoal dark:bg-lemon-yellow/10 dark:text-lemon-yellow px-3 py-1 text-sm rounded-full flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {workshop.level}
                </span>
              </div>
              
              <div className="prose prose-forest dark:prose-invert max-w-none mb-8">
                <p className="text-gray-700 dark:text-gray-300">{workshop.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-forest-green dark:text-moss-green mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Date & Time</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{formatDate(workshop.date)}</p>
                  <p className="text-gray-700 dark:text-gray-300">{workshop.sessions} session{workshop.sessions > 1 ? 's' : ''}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-forest-green dark:text-moss-green mb-2">
                    <User className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Instructor</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{workshop.instructor}</p>
                </div>
              </div>
              
              {/* Prerequisites Section */}
              {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-4">Prerequisites</h3>
                  <ul className="space-y-2">
                    {workshop.prerequisites.map((prerequisite, index) => (
                      <li 
                        key={index} 
                        className="flex items-start"
                      >
                        <CheckCircle className="h-5 w-5 text-forest-green dark:text-moss-green mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Schedule Section */}
              {workshop.schedule && workshop.schedule.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-4">Workshop Schedule</h3>
                  <div className="space-y-4">
                    {workshop.schedule.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center text-forest-green dark:text-moss-green mb-2">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">{item.time}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Materials Section */}
              {workshop.materials && workshop.materials.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-forest-green dark:text-moss-green mb-4">Workshop Materials</h3>
                  <ul className="space-y-2">
                    {workshop.materials.map((material, index) => (
                      <li 
                        key={index} 
                        className="flex items-start"
                      >
                        <FileText className="h-5 w-5 text-forest-green dark:text-moss-green mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Workshop Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400">The workshop you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-forest-green hover:bg-spring-garden text-white"
          >
            Return to Workshops
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkshopDetail; 