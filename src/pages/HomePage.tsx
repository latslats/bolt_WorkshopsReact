import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import FeaturedWorkshops from '../components/home/FeaturedWorkshops';
import Testimonials from '../components/home/Testimonials';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedWorkshops />
      
      {/* CTA Section */}
      <section className="bg-forest-green py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white-linen sm:text-4xl">
              <span className="block">Ready to start learning?</span>
              <span className="block text-lemon-yellow">Join our community today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-moss-green">
              Create a free account to register for workshops, track your progress, and connect with other developers.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link to="/signup">
                  <Button size="lg" className="bg-lemon-yellow text-charcoal hover:bg-lemon-yellow/90">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex">
                <Link to="/workshops">
                  <Button size="lg" variant="outline" className="border-moss-green text-moss-green hover:bg-moss-green/10">
                    Browse Workshops
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Testimonials />
    </>
  );
};

export default HomePage;
