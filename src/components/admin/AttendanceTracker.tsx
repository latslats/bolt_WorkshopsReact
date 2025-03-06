import React, { useState, useEffect } from 'react';
import { Check, X, Search, UserCheck, UserX, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { Workshop } from '../../types';
import { useDispatch } from 'react-redux';
import { updateAttendance } from '../../store/slices/workshopsSlice';

interface Attendee {
  id: string;
  name: string;
  email: string;
  attended: boolean;
}

interface AttendanceTrackerProps {
  workshopId: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ workshopId }) => {
  const dispatch = useDispatch();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  });

  // Fetch workshop and registered users
  useEffect(() => {
    const fetchWorkshopAndAttendees = async () => {
      try {
        setLoading(true);
        setError(null);
        const db = getFirestore();
        
        // Fetch workshop details
        const workshopDoc = await getDoc(doc(db, 'workshops', workshopId));
        if (!workshopDoc.exists()) {
          throw new Error('Workshop not found');
        }
        
        const workshopData = { id: workshopDoc.id, ...workshopDoc.data() } as Workshop;
        setWorkshop(workshopData);
        
        // Fetch registered users
        const registeredUsers: Attendee[] = [];
        
        // Check if the workshop has a registrations field
        if (workshopData.registrations && Array.isArray(workshopData.registrations)) {
          // Fetch user details for each registration
          for (const userId of workshopData.registrations) {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                registeredUsers.push({
                  id: userDoc.id,
                  name: userData.displayName || userData.name || 'Unknown User',
                  email: userData.email || 'No email',
                  attended: workshopData.attendance?.includes(userId) || false
                });
              }
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err);
            }
          }
        } else {
          // If no registrations field, create mock data for development
          registeredUsers.push(
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              attended: false
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              attended: true
            },
            {
              id: '3',
              name: 'Bob Johnson',
              email: 'bob@example.com',
              attended: false
            }
          );
        }
        
        setAttendees(registeredUsers);
        setFilteredAttendees(registeredUsers);
        
        // Calculate attendance stats
        const present = registeredUsers.filter(a => a.attended).length;
        setAttendanceStats({
          total: registeredUsers.length,
          present,
          absent: registeredUsers.length - present
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workshop data:', err);
        setError(`Failed to load workshop data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    fetchWorkshopAndAttendees();
  }, [workshopId]);

  // Filter attendees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAttendees(attendees);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = attendees.filter(
      attendee => 
        attendee.name.toLowerCase().includes(query) || 
        attendee.email.toLowerCase().includes(query)
    );
    
    setFilteredAttendees(filtered);
  }, [searchQuery, attendees]);

  // Mark user as attended/not attended
  const toggleAttendance = async (attendeeId: string, currentStatus: boolean) => {
    if (!workshop) return;
    
    try {
      setError(null);
      const db = getFirestore();
      const workshopRef = doc(db, 'workshops', workshopId);
      
      // Get current attendance array
      let currentAttendance = workshop.attendance || [];
      
      // Update attendance array
      let newAttendance: string[];
      if (currentStatus) {
        // Remove from attendance
        newAttendance = currentAttendance.filter(id => id !== attendeeId);
      } else {
        // Add to attendance
        newAttendance = [...currentAttendance, attendeeId];
      }
      
      // Update Firestore
      await updateDoc(workshopRef, {
        attendance: newAttendance
      });
      
      // Update Redux state
      dispatch(updateAttendance({
        workshopId,
        attendance: newAttendance
      }));
      
      // Update local state
      const updatedAttendees = attendees.map(attendee => 
        attendee.id === attendeeId 
          ? { ...attendee, attended: !currentStatus } 
          : attendee
      );
      
      setAttendees(updatedAttendees);
      
      // Update filtered attendees if needed
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        setFilteredAttendees(
          updatedAttendees.filter(
            attendee => 
              attendee.name.toLowerCase().includes(query) || 
              attendee.email.toLowerCase().includes(query)
          )
        );
      } else {
        setFilteredAttendees(updatedAttendees);
      }
      
      // Update attendance stats
      const present = updatedAttendees.filter(a => a.attended).length;
      setAttendanceStats({
        total: updatedAttendees.length,
        present,
        absent: updatedAttendees.length - present
      });
      
      // Update workshop state
      setWorkshop({
        ...workshop,
        attendance: newAttendance
      });
      
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(`Failed to update attendance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Mark all as attended/not attended
  const markAll = async (status: boolean) => {
    if (!workshop || !filteredAttendees.length) return;
    
    try {
      setError(null);
      const db = getFirestore();
      const workshopRef = doc(db, 'workshops', workshopId);
      
      // Get IDs to update
      const idsToUpdate = filteredAttendees.map(a => a.id);
      
      // Get current attendance array
      let currentAttendance = workshop.attendance || [];
      
      // Create new attendance array
      let newAttendance: string[];
      if (status) {
        // Add all filtered attendees to attendance
        newAttendance = [...new Set([...currentAttendance, ...idsToUpdate])];
      } else {
        // Remove all filtered attendees from attendance
        newAttendance = currentAttendance.filter(id => !idsToUpdate.includes(id));
      }
      
      // Update Firestore
      await updateDoc(workshopRef, {
        attendance: newAttendance
      });
      
      // Update Redux state
      dispatch(updateAttendance({
        workshopId,
        attendance: newAttendance
      }));
      
      // Update local state
      const updatedAttendees = attendees.map(attendee => 
        idsToUpdate.includes(attendee.id) 
          ? { ...attendee, attended: status } 
          : attendee
      );
      
      setAttendees(updatedAttendees);
      
      // Update filtered attendees
      const updatedFiltered = filteredAttendees.map(attendee => ({
        ...attendee,
        attended: status
      }));
      
      setFilteredAttendees(updatedFiltered);
      
      // Update attendance stats
      const present = updatedAttendees.filter(a => a.attended).length;
      setAttendanceStats({
        total: updatedAttendees.length,
        present,
        absent: updatedAttendees.length - present
      });
      
      // Update workshop state
      setWorkshop({
        ...workshop,
        attendance: newAttendance
      });
      
    } catch (err) {
      console.error('Error updating attendance for all:', err);
      setError(`Failed to update attendance: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <strong className="font-bold mr-1">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-forest-green dark:text-moss-green mb-6">
        Attendance Tracker
      </h2>
      
      {workshop && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {workshop.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(workshop.date).toLocaleDateString()} • {workshop.instructor}
          </p>
        </div>
      )}
      
      {/* Attendance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white-linen dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Registered</p>
          <p className="text-2xl font-bold text-charcoal dark:text-white">{attendanceStats.total}</p>
        </div>
        <div className="bg-moss-green/20 dark:bg-green-900/20 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
          <p className="text-2xl font-bold text-forest-green dark:text-moss-green">{attendanceStats.present}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
        </div>
      </div>
      
      {/* Search and Bulk Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <Button
            type="button"
            onClick={() => markAll(true)}
            disabled={!filteredAttendees.length}
            className="flex items-center"
          >
            <UserCheck size={18} className="mr-1" />
            Mark All Present
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => markAll(false)}
            disabled={!filteredAttendees.length}
            className="flex items-center"
          >
            <UserX size={18} className="mr-1" />
            Mark All Absent
          </Button>
        </div>
      </div>
      
      {/* Attendees List */}
      {filteredAttendees.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {attendees.length === 0 
            ? "No one has registered for this workshop yet." 
            : "No attendees match your search criteria."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {attendee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {attendee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {attendee.attended ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Present
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleAttendance(attendee.id, attendee.attended)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                        attendee.attended 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-forest-green hover:bg-spring-garden'
                      }`}
                    >
                      {attendee.attended ? (
                        <>
                          <X size={14} className="mr-1" />
                          Mark Absent
                        </>
                      ) : (
                        <>
                          <Check size={14} className="mr-1" />
                          Mark Present
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker; 