import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useSelector((state: RootState) => state.ui);
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 ${theme}`}>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#1f2937',
          },
        }}
      />
    </div>
  );
};

export default Layout;
