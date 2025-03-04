import React from 'react';
import { Code, Mail } from 'lucide-react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white-linen dark:bg-charcoal border-t border-moss-green/20 dark:border-moss-green/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <Code className="h-8 w-8 text-forest-green dark:text-moss-green" />
            <span className="ml-2 text-xl font-bold text-forest-green dark:text-moss-green">CodeWorkshops</span>
          </div>
          <p className="mt-4 text-charcoal dark:text-white-linen max-w-md text-center">
            A free platform to organize, discover, and participate in coding workshops. Built for the community, by the community.
          </p>
          <div className="mt-6 flex space-x-6">
            <a href="#" className="text-spring-garden hover:text-forest-green dark:text-moss-green dark:hover:text-lemon-yellow">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
            <a href="mailto:info@codeworkshops.org" className="text-spring-garden hover:text-forest-green dark:text-moss-green dark:hover:text-lemon-yellow">
              <span className="sr-only">Email</span>
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
        <div className="mt-12 border-t border-moss-green/20 dark:border-moss-green/10 pt-8">
          <p className="text-base text-charcoal dark:text-white-linen text-center">
            &copy; {new Date().getFullYear()} CodeWorkshops. Open source and free for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
