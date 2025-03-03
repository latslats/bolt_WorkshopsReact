import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workshopsReducer from './slices/workshopsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workshops: workshopsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
