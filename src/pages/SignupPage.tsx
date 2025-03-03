import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Layout from '../components/layout/Layout';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
