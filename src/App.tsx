import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import useAuth from './hooks/useAuth';
import { setupMockData } from './utils/mockData';

const App: React.FC = () => {
  // Initialize authentication
  const auth = useAuth();
  
  // Setup mock data for development
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      setupMockData();
    }
  }, []);
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default App;
