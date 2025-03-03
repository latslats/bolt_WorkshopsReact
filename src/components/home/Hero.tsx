import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import { Code, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="relative bg-white-linen dark:bg-charcoal overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white-linen dark:bg-charcoal sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white-linen dark:text-charcoal transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
            <div className="sm:text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-forest-green dark:text-moss-green sm:text-5xl md:text-6xl">
                  <span className="block">Manage coding workshops</span>
                  <span className="block text-spring-garden dark:text-lemon-yellow">simply and efficiently</span>
                </h1>
                <p className="mt-3 text-base text-charcoal dark:text-white-linen sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  A free platform to organize, discover, and participate in coding workshops. Perfect for educators, community organizers, and learners of all levels.
                </p>
              </motion.div>
              
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="rounded-md shadow">
                  <Link to="/workshops">
                    <Button 
                      size="lg" 
                      className="w-full flex items-center justify-center bg-forest-green hover:bg-spring-garden text-white-linen"
                      icon={<Code size={20} />}
                    >
                      Browse Workshops
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full flex items-center justify-center border-spring-garden text-spring-garden hover:bg-spring-garden hover:text-white-linen dark:border-moss-green dark:text-moss-green dark:hover:bg-moss-green dark:hover:text-charcoal"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Create Account'}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
          alt="Person coding with AI assistance"
        />
      </div>
    </div>
  );
};

export default Hero;
