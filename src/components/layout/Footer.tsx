import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Mail, Twitter } from 'lucide-react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white-linen dark:bg-charcoal border-t border-moss-green/20 dark:border-moss-green/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-forest-green dark:text-moss-green" />
              <span className="ml-2 text-xl font-bold text-forest-green dark:text-moss-green">CodeWorkshops</span>
            </div>
            <p className="mt-4 text-charcoal dark:text-white-linen max-w-md">
              A free platform to organize, discover, and participate in coding workshops. Built for the community, by the community.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-spring-garden hover:text-forest-green dark:text-moss-green dark:hover:text-lemon-yellow">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
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
          <div>
            <h3 className="text-sm font-semibold text-spring-garden dark:text-moss-green uppercase tracking-wider">Workshops</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/workshops" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  All Workshops
                </Link>
              </li>
              <li>
                <Link to="/workshops?topic=Python" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  Python
                </Link>
              </li>
              <li>
                <Link to="/workshops?topic=JavaScript" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  JavaScript
                </Link>
              </li>
              <li>
                <Link to="/workshops?topic=AI" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  AI Development
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-spring-garden dark:text-moss-green uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-charcoal dark:text-white-linen hover:text-forest-green dark:hover:text-lemon-yellow">
                  Terms
                </Link>
              </li>
            </ul>
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
