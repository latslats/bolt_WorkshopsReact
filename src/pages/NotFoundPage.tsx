import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button icon={<Home size={18} />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
