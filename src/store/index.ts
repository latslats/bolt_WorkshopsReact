import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import workshopsReducer from './slices/workshopsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    workshops: workshopsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
