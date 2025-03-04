import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import useAuth from './hooks/useAuth';
import { setupMockData } from './utils/mockData';

const App: React.FC = () => {
  // Initialize authentication
  const auth = useAuth();
  const location = useLocation();
  
  // Setup mock data for development
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      setupMockData();
    }
  }, []);
  
  // Ensure light theme is always applied
  useEffect(() => {
    // Remove dark class if it exists
    document.documentElement.classList.remove('dark');
  }, []);
  
  // Determine if the current route should use the main layout
  // Pages like Login and Signup have their own layout
  const shouldUseLayout = !['/login', '/signup', '/404'].includes(location.pathname);
  
  return shouldUseLayout ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Outlet />
  );
};

export default App;
