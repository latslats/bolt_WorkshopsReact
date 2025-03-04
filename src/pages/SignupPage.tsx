import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-forest-green hover:text-forest-green/80">
              Sign in
            </Link>
          </p>
        </div>
        <SignupForm />
      </motion.div>
    </div>
  );
};

export default SignupPage;
