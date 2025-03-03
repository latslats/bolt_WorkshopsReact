import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Menu, X, Code, User, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white-linen dark:bg-charcoal shadow-sm border-b border-moss-green/20 dark:border-moss-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Code className="h-8 w-8 text-forest-green dark:text-moss-green" />
                <span className="ml-2 text-xl font-bold text-forest-green dark:text-moss-green">CodeWorkshops</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green' 
                    : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green'
                }`}
              >
                Home
              </Link>
              <Link
                to="/workshops"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/workshops') 
                    ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green' 
                    : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green'
                }`}
              >
                Workshops
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green' 
                      : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    className="text-charcoal dark:text-white-linen"
                    icon={<User size={18} />}
                  >
                    {user?.displayName || 'Profile'}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-charcoal dark:text-white-linen"
                  icon={<LogOut size={18} />}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-charcoal dark:text-white-linen">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-forest-green hover:bg-spring-garden text-white-linen dark:bg-spring-garden dark:hover:bg-moss-green">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-charcoal dark:text-white-linen hover:text-forest-green hover:bg-moss-green/10 dark:hover:text-moss-green dark:hover:bg-spring-garden/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green bg-moss-green/10 dark:bg-spring-garden/10' 
                  : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10'
              }`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/workshops"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/workshops') 
                  ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green bg-moss-green/10 dark:bg-spring-garden/10' 
                  : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10'
              }`}
              onClick={toggleMenu}
            >
              Workshops
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard') 
                    ? 'border-forest-green text-forest-green dark:border-moss-green dark:text-moss-green bg-moss-green/10 dark:bg-spring-garden/10' 
                    : 'border-transparent text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10'
                }`}
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-moss-green/20 dark:border-moss-green/10">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-charcoal hover:text-forest-green hover:border-spring-garden hover:bg-moss-green/10 dark:text-white-linen dark:hover:text-moss-green dark:hover:border-moss-green dark:hover:bg-spring-garden/10"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
