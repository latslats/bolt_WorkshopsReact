import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import useAuth from './hooks/useAuth';
import { ensureFirebaseConnection } from './utils/firebaseConnectionCheck';

const App: React.FC = () => {
  // Initialize authentication
  const auth = useAuth();
  const location = useLocation();
  
  // Check Firebase connection on app start (non-blocking)
  useEffect(() => {
    // This is now a synchronous check that won't block rendering
    ensureFirebaseConnection();
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
