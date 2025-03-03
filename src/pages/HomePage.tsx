import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import FeaturedWorkshops from '../components/home/FeaturedWorkshops';
import Features from '../components/home/Features';
import { useWorkshops } from '../hooks/useWorkshops';

const HomePage: React.FC = () => {
  // Load workshops data
  useWorkshops();
  
  return (
    <Layout>
      <Hero />
      <Features />
      <FeaturedWorkshops />
      {/* Testimonials section removed */}
    </Layout>
  );
};

export default HomePage;
