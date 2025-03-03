import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import useAuth from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import WorkshopsPage from './pages/WorkshopsPage';
import WorkshopDetailPage from './pages/WorkshopDetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Mock data for development
import { setupMockData } from './utils/mockData';

const AppContent: React.FC = () => {
  // Initialize authentication
  useAuth();
  
  // Setup mock data for development
  useEffect(() => {
    setupMockData();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workshops" element={<WorkshopsPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
