import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, clearFilters } from '../../store/slices/workshopsSlice';
import { RootState } from '../../store';
import { Filter, SortAsc, X } from 'lucide-react';
import Button from '../ui/Button';

const WorkshopFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.workshops);
  
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const topics = ['Python', 'JavaScript', 'AI', 'Web Development', 'Data Science'];
  
  const handleDifficultyChange = (difficulty: string | null) => {
    dispatch(setFilter({ key: 'difficulty', value: difficulty }));
  };
  
  const handleTopicChange = (topic: string | null) => {
    dispatch(setFilter({ key: 'topic', value: topic }));
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilter({ key: 'sortBy', value: e.target.value }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ key: 'search', value: e.target.value }));
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };
  
  const hasActiveFilters = filters.difficulty || filters.topic || filters.search;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            icon={<X size={16} />}
          >
            Clear filters
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search workshops..."
            value={filters.search}
            onChange={handleSearchChange}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleDifficultyChange(filters.difficulty === difficulty ? null : difficulty)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filters.difficulty === difficulty
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-2 border-indigo-500'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicChange(filters.topic === topic ? null : topic)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filters.topic === topic
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-2 border-indigo-500'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-2 border-transparent'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort by
          </label>
          <div className="flex items-center">
            <SortAsc className="h-5 w-5 text-gray-400 mr-2" />
            <select
              id="sort"
              value={filters.sortBy}
              onChange={handleSortChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
            >
              <option value="date">Date (Upcoming first)</option>
              <option value="difficulty">Difficulty</option>
              <option value="topic">Topic</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopFilters;
