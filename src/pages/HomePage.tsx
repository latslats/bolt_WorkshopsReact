import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import FeaturedWorkshops from '../components/home/FeaturedWorkshops';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedWorkshops />
    </>
  );
};

export default HomePage;
