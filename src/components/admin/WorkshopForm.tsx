import React, { useState, useEffect } from 'react';
import { Workshop, ScheduleItem } from '../../types';
import Button from '../ui/Button';
import { PlusCircle, X, Clock, List } from 'lucide-react';

interface WorkshopFormProps {
  workshop?: Workshop;
  onSubmit: (workshopData: Omit<Workshop, 'id'>) => void;
  onCancel: () => void;
}

const WorkshopForm: React.FC<WorkshopFormProps> = ({ 
  workshop, 
  onSubmit, 
  onCancel 
}) => {
  const isEditMode = !!workshop;
  
  // Form state
  const [title, setTitle] = useState(workshop?.title || '');
  const [description, setDescription] = useState(workshop?.description || '');
  const [instructor, setInstructor] = useState(workshop?.instructor || '');
  const [date, setDate] = useState(workshop?.date || '');
  const [sessions, setSessions] = useState(workshop?.sessions || 1);
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    workshop?.level || 'Beginner'
  );
  const [tags, setTags] = useState<string[]>(workshop?.tags || []);
  const [capacity, setCapacity] = useState(workshop?.capacity || 20);
  const [registered, setRegistered] = useState(workshop?.registered || 0);
  const [materials, setMaterials] = useState<string[]>(workshop?.materials || []);
  const [imageUrl, setImageUrl] = useState(workshop?.imageUrl || '');
  const [prerequisites, setPrerequisites] = useState<string[]>(workshop?.prerequisites || []);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(workshop?.schedule || []);
  const [newTag, setNewTag] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newScheduleItem, setNewScheduleItem] = useState<ScheduleItem>({ time: '', title: '', description: '' });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!instructor.trim()) newErrors.instructor = 'Instructor is required';
    if (!date) newErrors.date = 'Date is required';
    if (sessions < 1) newErrors.sessions = 'At least 1 session is required';
    if (capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (registered > capacity) newErrors.registered = 'Registered cannot exceed capacity';
    
    // If there are errors, mark all fields as touched and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched: Record<string, boolean> = {};
      ['title', 'description', 'instructor', 'date', 'sessions', 'capacity', 'registered'].forEach(
        field => allTouched[field] = true
      );
      setTouched(allTouched);
      return;
    }
    
    // Submit the form
    onSubmit({
      title,
      description,
      instructor,
      date,
      sessions,
      level,
      tags,
      capacity,
      registered,
      materials,
      imageUrl,
      prerequisites,
      schedule
    });
  };
  
  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };
  
  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Add a new material
  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials([...materials, newMaterial.trim()]);
      setNewMaterial('');
    }
  };
  
  // Remove a material
  const removeMaterial = (materialToRemove: string) => {
    setMaterials(materials.filter(material => material !== materialToRemove));
  };

  // Add a new prerequisite
  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };
  
  // Remove a prerequisite
  const removePrerequisite = (prerequisiteToRemove: string) => {
    setPrerequisites(prerequisites.filter(prerequisite => prerequisite !== prerequisiteToRemove));
  };

  // Add a new schedule item
  const addScheduleItem = () => {
    if (newScheduleItem.time.trim() && newScheduleItem.title.trim()) {
      setSchedule([...schedule, { ...newScheduleItem }]);
      setNewScheduleItem({ time: '', title: '', description: '' });
    }
  };
  
  // Remove a schedule item
  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  // Update a schedule item field
  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setSchedule(updatedSchedule);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-forest-green dark:text-moss-green mb-6">
        {isEditMode ? 'Edit Workshop' : 'Create New Workshop'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.title && errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.title && errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => handleBlur('description')}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>
        
        {/* Instructor */}
        <div>
          <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructor *
          </label>
          <input
            type="text"
            id="instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            onBlur={() => handleBlur('instructor')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.instructor && errors.instructor ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.instructor && errors.instructor && (
            <p className="mt-1 text-sm text-red-500">{errors.instructor}</p>
          )}
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => handleBlur('date')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.date && errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.date && errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>
        
        {/* Level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Level *
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        {/* Sessions */}
        <div>
          <label htmlFor="sessions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Sessions *
          </label>
          <input
            type="number"
            id="sessions"
            min="1"
            value={sessions}
            onChange={(e) => setSessions(parseInt(e.target.value) || 1)}
            onBlur={() => handleBlur('sessions')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.sessions && errors.sessions ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.sessions && errors.sessions && (
            <p className="mt-1 text-sm text-red-500">{errors.sessions}</p>
          )}
        </div>
        
        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Capacity *
          </label>
          <input
            type="number"
            id="capacity"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            onBlur={() => handleBlur('capacity')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
              touched.capacity && errors.capacity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.capacity && errors.capacity && (
            <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>
          )}
        </div>
        
        {/* Registered (only for edit mode) */}
        {isEditMode && (
          <div>
            <label htmlFor="registered" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currently Registered
            </label>
            <input
              type="number"
              id="registered"
              min="0"
              max={capacity}
              value={registered}
              onChange={(e) => setRegistered(parseInt(e.target.value) || 0)}
              onBlur={() => handleBlur('registered')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600 ${
                touched.registered && errors.registered ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.registered && errors.registered && (
              <p className="mt-1 text-sm text-red-500">{errors.registered}</p>
            )}
          </div>
        )}
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <div 
                key={index} 
                className="bg-moss-green/20 text-forest-green px-3 py-1 rounded-full flex items-center"
              >
                <span>{tag}</span>
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-forest-green hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-forest-green text-white rounded-r-md hover:bg-spring-garden"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Prerequisites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prerequisites
          </label>
          <div className="flex flex-col gap-2 mb-2">
            {prerequisites.map((prerequisite, index) => (
              <div 
                key={index} 
                className="bg-lemon-yellow/20 text-charcoal px-3 py-2 rounded-md flex items-center justify-between border border-gray-200"
              >
                <span>{prerequisite}</span>
                <button 
                  type="button" 
                  onClick={() => removePrerequisite(prerequisite)}
                  className="text-charcoal hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="Add a prerequisite (e.g., Basic JavaScript knowledge)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
            />
            <button
              type="button"
              onClick={addPrerequisite}
              className="px-3 py-2 bg-forest-green text-white rounded-r-md hover:bg-spring-garden"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Schedule
          </label>
          <div className="flex flex-col gap-4 mb-4">
            {schedule.map((item, index) => (
              <div 
                key={index} 
                className="bg-white-linen dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Clock size={16} className="text-forest-green mr-2" />
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                      placeholder="Time (e.g., 10:00 AM - 11:30 AM)"
                      className="px-2 py-1 border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-forest-green"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeScheduleItem(index)}
                    className="text-charcoal hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="w-full px-2 py-1 mb-2 border-b border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:border-forest-green font-medium"
                />
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-2 py-1 bg-transparent focus:outline-none focus:border-forest-green text-sm"
                />
              </div>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
            <h4 className="font-medium mb-2 flex items-center text-forest-green">
              <Clock size={16} className="mr-2" />
              Add Schedule Item
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newScheduleItem.time}
                onChange={(e) => setNewScheduleItem({...newScheduleItem, time: e.target.value})}
                placeholder="Time (e.g., 10:00 AM - 11:30 AM)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                value={newScheduleItem.title}
                onChange={(e) => setNewScheduleItem({...newScheduleItem, title: e.target.value})}
                placeholder="Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              />
              <textarea
                value={newScheduleItem.description || ''}
                onChange={(e) => setNewScheduleItem({...newScheduleItem, description: e.target.value})}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              />
              <Button 
                type="button" 
                onClick={addScheduleItem}
                disabled={!newScheduleItem.time.trim() || !newScheduleItem.title.trim()}
                className="w-full"
              >
                <PlusCircle size={16} className="mr-2" />
                Add to Schedule
              </Button>
            </div>
          </div>
        </div>
        
        {/* Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Materials
          </label>
          <div className="flex flex-col gap-2 mb-2">
            {materials.map((material, index) => (
              <div 
                key={index} 
                className="bg-white-linen text-charcoal px-3 py-2 rounded-md flex items-center justify-between border border-gray-200"
              >
                <span>{material}</span>
                <button 
                  type="button" 
                  onClick={() => removeMaterial(material)}
                  className="text-charcoal hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Add a material (e.g., PDF guide, GitHub repo)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
            />
            <button
              type="button"
              onClick={addMaterial}
              className="px-3 py-2 bg-forest-green text-white rounded-r-md hover:bg-spring-garden"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
          />
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <img 
                src={imageUrl} 
                alt="Workshop preview" 
                className="h-40 object-cover rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://source.unsplash.com/random/800x600/?workshop`;
                }}
              />
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Update Workshop' : 'Create Workshop'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopForm; 