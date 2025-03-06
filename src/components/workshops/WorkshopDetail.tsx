import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Workshop } from '../../types';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

interface WorkshopDetailProps {
  workshop: Workshop;
  onRegister: () => void;
}

const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ workshop, onRegister }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = React.useState('description');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-forest-green dark:text-moss-green mb-2">
          {workshop.title}
        </h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm px-3 py-1 rounded-full">
            {workshop.level || 'All Levels'}
          </span>
          {workshop.tags && workshop.tags.length > 0 ? (
            workshop.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1 rounded-full">
              Workshop
            </span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Calendar size={16} className="mr-1" />
          <span className="mr-4">{new Date(workshop.date).toLocaleDateString()}</span>
          <Clock size={16} className="mr-1" />
          <span>{workshop.sessions} sessions, 1 hour each</span>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['description', 'schedule', 'prerequisites', 'materials'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab 
                    ? 'border-forest-green dark:border-moss-green text-forest-green dark:text-moss-green' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mb-8">
          {activeTab === 'description' && (
            <p className="text-gray-700 dark:text-gray-300">
              {workshop.description}
            </p>
          )}
          
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                This workshop consists of {workshop.sessions} sessions, each lasting approximately 1 hour.
              </p>
              
              {workshop.schedule && workshop.schedule.length > 0 ? (
                <div className="space-y-6 mt-4">
                  {workshop.schedule.map((item, index) => (
                    <div key={index} className="border-l-4 border-forest-green pl-4 py-2">
                      <div className="flex items-center text-forest-green dark:text-moss-green mb-1">
                        <Clock size={16} className="mr-2" />
                        <span className="font-medium">{item.time}</span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                  <li>Session 1: Introduction to concepts</li>
                  <li>Session 2: Hands-on practice</li>
                  <li>Session 3: Advanced techniques and Q&A</li>
                </ul>
              )}
            </div>
          )}
          
          {activeTab === 'prerequisites' && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                To get the most out of this workshop, you should have:
              </p>
              
              {workshop.prerequisites && workshop.prerequisites.length > 0 ? (
                <ul className="space-y-2 mt-4">
                  {workshop.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-forest-green dark:text-moss-green mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                  <li>Basic programming knowledge</li>
                  <li>A laptop with internet connection</li>
                  <li>Enthusiasm to learn!</li>
                </ul>
              )}
            </div>
          )}
          
          {activeTab === 'materials' && (
            <div className="space-y-4">
              {workshop.materials && workshop.materials.length > 0 ? (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    The following materials will be available for this workshop:
                  </p>
                  <ul className="space-y-2">
                    {workshop.materials.map((material, index) => (
                      <li key={index} className="bg-white-linen dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  Workshop materials will be available after registration.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-forest-green dark:text-moss-green mb-4">
            Instructor
          </h3>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
              <User size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{workshop.instructor || 'Instructor'}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Senior Developer with 10+ years of experience 
                {workshop.tags && workshop.tags.length > 0 
                  ? ` in ${workshop.tags.join(' and ')} technologies.`
                  : ' in various technologies.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Register to access workshop materials and secure your spot.
          </p>
          <Button 
            onClick={onRegister}
            disabled={!isAuthenticated}
            className="bg-forest-green hover:bg-spring-garden text-white"
          >
            {isAuthenticated ? 'Register' : 'Sign in to Register'}
          </Button>
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You need to be signed in to register for workshops.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
