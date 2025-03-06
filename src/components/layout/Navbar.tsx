import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Menu, X, Settings } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <>
      {/* Top banner */}
      <div className="bg-forest-green text-white-linen py-2 px-4 text-center text-sm">
        Making learning with code simpler, and better.
      </div>
      
      {/* Main navigation */}
      <nav className="bg-white-linen border-b border-moss-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-forest-green tracking-tight">
                    Bark & Build Lab
                  </span>
                  <span className="text-xs text-spring-garden italic mt-[-2px]">
                    by Earth Rated
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-spring-garden text-sm font-medium text-charcoal hover:text-forest-green">
                  Home
                </Link>
                <Link to="/workshops" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-spring-garden text-sm font-medium text-charcoal hover:text-forest-green">
                  Workshops
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Settings size={16} />
                        <span>Admin</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-lemon-yellow text-charcoal hover:bg-lemon-yellow/80" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-charcoal hover:text-forest-green hover:bg-moss-green/20"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1 bg-white-linen">
              <Link
                to="/"
                className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/workshops"
                className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                Workshops
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-moss-green/20 bg-white-linen">
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block pl-3 pr-4 py-2 text-base font-medium text-charcoal hover:bg-moss-green/20 hover:text-forest-green"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
