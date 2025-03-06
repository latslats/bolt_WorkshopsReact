import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Users } from 'lucide-react';

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
        
        const userPromises = userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as User;
          }
          return null;
        });
        
        const fetchedUsers = (await Promise.all(userPromises)).filter(
          (user): user is User => user !== null
        );
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load registered users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userIds]);

  if (loading) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="animate-pulse h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-sm">
        {error}
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