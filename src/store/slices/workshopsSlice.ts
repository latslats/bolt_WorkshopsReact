import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workshop } from '../../types';

interface WorkshopsState {
  workshops: Workshop[];
  filteredWorkshops: Workshop[];
  currentWorkshop: Workshop | null;
  loading: boolean;
  error: string | null;
  filters: {
    difficulty: string | null;
    topic: string | null;
    search: string;
    sortBy: 'date' | 'difficulty' | 'topic';
  };
}

const initialState: WorkshopsState = {
  workshops: [],
  filteredWorkshops: [],
  currentWorkshop: null,
  loading: false,
  error: null,
  filters: {
    difficulty: null,
    topic: null,
    search: '',
    sortBy: 'date',
  },
};

const workshopsSlice = createSlice({
  name: 'workshops',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWorkshops: (state, action: PayloadAction<Workshop[]>) => {
      state.workshops = action.payload;
      state.filteredWorkshops = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentWorkshop: (state, action: PayloadAction<Workshop | null>) => {
      state.currentWorkshop = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilter: (state, action: PayloadAction<{ key: 'difficulty' | 'topic' | 'search' | 'sortBy', value: any }>) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      
      // Apply filters
      let filtered = [...state.workshops];
      
      if (state.filters.difficulty) {
        filtered = filtered.filter(w => w.difficulty === state.filters.difficulty);
      }
      
      if (state.filters.topic) {
        filtered = filtered.filter(w => w.topic === state.filters.topic);
      }
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(w => 
          w.title.toLowerCase().includes(searchLower) || 
          w.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      switch (state.filters.sortBy) {
        case 'date':
          filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          break;
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
          break;
        case 'topic':
          filtered.sort((a, b) => a.topic.localeCompare(b.topic));
          break;
      }
      
      state.filteredWorkshops = filtered;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredWorkshops = state.workshops;
    },
  },
});

export const { 
  setLoading, 
  setWorkshops, 
  setCurrentWorkshop, 
  setError, 
  setFilter,
  clearFilters 
} = workshopsSlice.actions;

export default workshopsSlice.reducer;
