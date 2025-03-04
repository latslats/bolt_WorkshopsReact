import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopsState, Workshop } from '../../types';
import { getWorkshops } from '../../utils/mockData';

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
      state.loading = false;
      state.error = action.payload;
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
      // This would typically call filterWorkshops logic
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
        const workshops = getWorkshops();
        const updatedWorkshops = workshops.map(w => 
          w.id === workshopId ? { ...w, registered: w.registered + 1 } : w
        );
        localStorage.setItem('workshops', JSON.stringify(updatedWorkshops));
      }
    }
  }
});

export const { 
  fetchWorkshopsStart, 
  fetchWorkshopsSuccess, 
  fetchWorkshopsFailure,
  filterWorkshops,
  setFilter,
  clearFilters,
  registerForWorkshop
} = workshopsSlice.actions;

export default workshopsSlice.reducer;
