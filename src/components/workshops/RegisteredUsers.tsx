import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Users, RefreshCw } from 'lucide-react';
import { isOnline, safelyEnableNetwork } from '../../utils/firebaseConnectionReset';

interface RegisteredUsersProps {
  userIds: string[];
  maxDisplay?: number;
}

const RegisteredUsers: React.FC<RegisteredUsersProps> = ({ 
  userIds, 
  maxDisplay = 5 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userIds || userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const db = getFirestore();
        
        // Check if we're online and try to enable network if needed
        if (!isOnline()) {
          throw new Error('You appear to be offline. Please check your internet connection.');
        }
        
        // Try to ensure network is enabled
        await safelyEnableNetwork(db);
        
        const userPromises = userIds.map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              return { id: userDoc.id, ...userDoc.data() } as User;
            }
          } catch (err) {
            console.warn(`Error fetching user ${userId}:`, err);
          }
          return null;
        });
        
        const fetchedUsers = (await Promise.all(userPromises)).filter(
          (user): user is User => user !== null
        );
        
        setUsers(fetchedUsers);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        
        // Provide a more helpful error message
        if (err.message?.includes('offline') || !isOnline()) {
          setError('Failed to load users - you appear to be offline');
        } else {
          setError('Failed to load registered users');
        }
        
        // If we have users from a previous fetch, keep showing them
        if (users.length > 0) {
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Set up an interval to retry if we're in an error state
    let retryInterval: number | undefined;
    
    if (error && retryCount < 3) {
      retryInterval = window.setInterval(() => {
        if (isOnline()) {
          setRetryCount(prev => prev + 1);
          fetchUsers();
        }
      }, 5000); // Retry every 5 seconds, up to 3 times
    }
    
    // Clean up interval on unmount
    return () => {
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, [userIds, retryCount]);

  // Add a manual retry button
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="animate-pulse h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="text-red-500 dark:text-red-400 text-sm flex items-center">
          <span>{error}</span>
          <button 
            onClick={handleRetry}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Retry loading users"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {users.length > 0 && (
          <div className="text-sm text-gray-500">
            Showing previously loaded data
          </div>
        )}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <Users size={16} className="mr-2" />
        <span>No registrations yet</span>
      </div>
    );
  }

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Registered Participants
      </h4>
      
      <div className="flex flex-wrap items-center gap-2">
        {displayUsers.map((user) => (
          <div 
            key={user.id} 
            className="flex items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-sm border border-gray-100 dark:border-gray-700"
            title={user.name}
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.name} 
                className="w-6 h-6 rounded-full mr-1.5 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                }}
              />
            ) : (
              <div 
                className="w-6 h-6 rounded-full mr-1.5 bg-forest-green dark:bg-moss-green text-white flex items-center justify-center text-xs font-medium"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
              {user.name}
            </span>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredUsers; 