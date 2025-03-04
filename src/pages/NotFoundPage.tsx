import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <h1 className="text-9xl font-extrabold text-forest-green">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
