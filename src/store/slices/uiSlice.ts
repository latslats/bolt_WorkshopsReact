import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light';
  sidebarOpen: boolean;
}

const initialState: UiState = {
  theme: 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme is now fixed to light
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
