import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopsState, Workshop } from '../../types';
import { mockWorkshops } from '../../utils/mockData';

const initialState: WorkshopsState = {
  workshops: [],
  filteredWorkshops: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    difficulty: null,
    topic: null,
    sortBy: 'date'
  }
};

const workshopsSlice = createSlice({
  name: 'workshops',
  initialState,
  reducers: {
    setWorkshops(state, action: PayloadAction<Workshop[]>) {
      state.workshops = action.payload;
      state.filteredWorkshops = action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchWorkshopsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWorkshopsSuccess(state, action: PayloadAction<Workshop[]>) {
      state.workshops = action.payload;
      state.filteredWorkshops = action.payload;
      state.loading = false;
    },
    fetchWorkshopsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    filterWorkshops(state, action: PayloadAction<{ 
      search?: string; 
      level?: string; 
      tags?: string[] 
    }>) {
      const { search, level, tags } = action.payload;
      
      state.filteredWorkshops = state.workshops.filter(workshop => {
        // Filter by search term
        if (search && !workshop.title.toLowerCase().includes(search.toLowerCase()) && 
            !workshop.description.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        
        // Filter by level
        if (level && workshop.level !== level) {
          return false;
        }
        
        // Filter by tags
        if (tags && tags.length > 0) {
          const hasAllTags = tags.every(tag => workshop.tags.includes(tag));
          if (!hasAllTags) {
            return false;
          }
        }
        
        return true;
      });
    },
    setFilter(state, action: PayloadAction<{ key: string; value: any }>) {
      const { key, value } = action.payload;
      state.filters = {
        ...state.filters,
        [key]: value
      };
      
      // Apply filters immediately
      const { search, difficulty, topic } = state.filters;
      
      state.filteredWorkshops = state.workshops.filter(workshop => {
        // Filter by search term
        if (search && !workshop.title.toLowerCase().includes(search.toLowerCase()) && 
            !workshop.description.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        
        // Filter by difficulty (level)
        if (difficulty && workshop.level !== difficulty) {
          return false;
        }
        
        // Filter by topic (tag)
        if (topic && !workshop.tags.includes(topic)) {
          return false;
        }
        
        return true;
      });
      
      // Apply sorting
      if (state.filters.sortBy === 'date') {
        state.filteredWorkshops.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (state.filters.sortBy === 'difficulty') {
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        state.filteredWorkshops.sort((a, b) => 
          (difficultyOrder[a.level as keyof typeof difficultyOrder] || 0) - 
          (difficultyOrder[b.level as keyof typeof difficultyOrder] || 0)
        );
      }
    },
    clearFilters(state) {
      state.filters = {
        search: '',
        difficulty: null,
        topic: null,
        sortBy: 'date'
      };
      state.filteredWorkshops = state.workshops;
    },
    registerForWorkshop(state, action: PayloadAction<string>) {
      const workshopId = action.payload;
      const workshop = state.workshops.find(w => w.id === workshopId);
      
      if (workshop && workshop.registered < workshop.capacity) {
        workshop.registered += 1;
        
        // Update localStorage
        const workshops = mockWorkshops;
        const updatedWorkshops = workshops.map(w => 
          w.id === workshopId ? { ...w, registered: w.registered + 1 } : w
        );
        localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
      }
    },
    addWorkshop(state, action: PayloadAction<Workshop>) {
      const newWorkshop = action.payload;
      state.workshops.push(newWorkshop);
      
      // Apply current filters to update filteredWorkshops
      const { search, difficulty, topic } = state.filters;
      let shouldInclude = true;
      
      // Check if the new workshop matches current filters
      if (search && !newWorkshop.title.toLowerCase().includes(search.toLowerCase()) && 
          !newWorkshop.description.toLowerCase().includes(search.toLowerCase())) {
        shouldInclude = false;
      }
      
      if (difficulty && newWorkshop.level !== difficulty) {
        shouldInclude = false;
      }
      
      if (topic && !newWorkshop.tags.includes(topic)) {
        shouldInclude = false;
      }
      
      if (shouldInclude) {
        state.filteredWorkshops.push(newWorkshop);
        
        // Apply sorting if needed
        if (state.filters.sortBy === 'date') {
          state.filteredWorkshops.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (state.filters.sortBy === 'difficulty') {
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          state.filteredWorkshops.sort((a, b) => 
            (difficultyOrder[a.level as keyof typeof difficultyOrder] || 0) - 
            (difficultyOrder[b.level as keyof typeof difficultyOrder] || 0)
          );
        }
      }
    },
    updateWorkshop(state, action: PayloadAction<Workshop>) {
      const updatedWorkshop = action.payload;
      
      // Update in workshops array
      state.workshops = state.workshops.map(workshop => 
        workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop
      );
      
      // Update in filteredWorkshops array
      const { search, difficulty, topic } = state.filters;
      let shouldInclude = true;
      
      // Check if the updated workshop matches current filters
      if (search && !updatedWorkshop.title.toLowerCase().includes(search.toLowerCase()) && 
          !updatedWorkshop.description.toLowerCase().includes(search.toLowerCase())) {
        shouldInclude = false;
      }
      
      if (difficulty && updatedWorkshop.level !== difficulty) {
        shouldInclude = false;
      }
      
      if (topic && !updatedWorkshop.tags.includes(topic)) {
        shouldInclude = false;
      }
      
      // If it should be included, update it; otherwise, remove it
      if (shouldInclude) {
        state.filteredWorkshops = state.filteredWorkshops.map(workshop => 
          workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop
        );
      } else {
        state.filteredWorkshops = state.filteredWorkshops.filter(
          workshop => workshop.id !== updatedWorkshop.id
        );
      }
      
      // Apply sorting if needed
      if (state.filters.sortBy === 'date') {
        state.filteredWorkshops.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (state.filters.sortBy === 'difficulty') {
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        state.filteredWorkshops.sort((a, b) => 
          (difficultyOrder[a.level as keyof typeof difficultyOrder] || 0) - 
          (difficultyOrder[b.level as keyof typeof difficultyOrder] || 0)
        );
      }
    },
    deleteWorkshop(state, action: PayloadAction<string>) {
      const workshopId = action.payload;
      
      // Remove from workshops array
      state.workshops = state.workshops.filter(workshop => workshop.id !== workshopId);
      
      // Remove from filteredWorkshops array
      state.filteredWorkshops = state.filteredWorkshops.filter(
        workshop => workshop.id !== workshopId
      );
    },
    updateAttendance(state, action: PayloadAction<{ workshopId: string, attendance: string[] }>) {
      const { workshopId, attendance } = action.payload;
      
      // Update in workshops array
      state.workshops = state.workshops.map(workshop => 
        workshop.id === workshopId 
          ? { ...workshop, attendance } 
          : workshop
      );
      
      // Update in filteredWorkshops array
      state.filteredWorkshops = state.filteredWorkshops.map(workshop => 
        workshop.id === workshopId 
          ? { ...workshop, attendance } 
          : workshop
      );
    }
  }
});

export const { 
  setWorkshops,
  setLoading,
  setError,
  fetchWorkshopsStart, 
  fetchWorkshopsSuccess, 
  fetchWorkshopsFailure,
  filterWorkshops,
  setFilter,
  clearFilters,
  registerForWorkshop,
  addWorkshop,
  updateWorkshop,
  deleteWorkshop,
  updateAttendance
} = workshopsSlice.actions;

export default workshopsSlice.reducer;
