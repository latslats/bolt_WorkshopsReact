import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser, setError } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { signInWithGoogle, getRedirectResult, refreshAuthToken } from '../../services/authService';
import { auth, resetFirestoreConnection } from '../../config/firebase';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isResettingConnection, setIsResettingConnection] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      // Check if there's a pending redirect authentication
      const isPendingRedirect = localStorage.getItem('auth_redirect_pending') === 'true';
      
      if (isPendingRedirect) {
        setLoading(true);
        const toastId = toast.loading('Completing Google sign-in...');
        
        try {
          console.log('Checking for redirect result');
          const result = await getRedirectResult();
          
          // Clear the pending flag
          localStorage.removeItem('auth_redirect_pending');
          
          if (result && result.user) {
            console.log('Redirect authentication successful');
            
            // Refresh token immediately to prevent Firestore token issues
            console.log('Refreshing auth token after redirect login');
            await refreshAuthToken();
            
            // The auth state listener will handle updating the user state
            toast.success('Logged in with Google successfully!', { id: toastId });
            navigate('/dashboard');
          } else {
            console.log('No redirect result found');
            toast.error('Google sign-in was not completed', { id: toastId });
          }
        } catch (error: any) {
          console.error('Error processing redirect result:', error);
          localStorage.removeItem('auth_redirect_pending');
          
          const errorMessage = error.message || 'Failed to complete Google sign-in';
          setFormError(errorMessage);
          dispatch(setError(errorMessage));
          toast.error(errorMessage, { id: toastId });
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkRedirectResult();
  }, [dispatch, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setFormError('');
    
    // Create a toast notification that can be updated
    const toastId = toast.loading('Signing in with Google...');
    
    try {
      console.log('Attempting to sign in with Google');
      const userData = await signInWithGoogle();
      console.log('Google sign in successful, user data:', userData);
      
      // Firestore token is refreshed inside signInWithGoogle now
      dispatch(setUser(userData));
      
      // Update the toast notification
      toast.success('Logged in with Google successfully!', { id: toastId });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.message || 'Failed to login with Google. Please try again.';
      
      // Special case for redirect initiated - don't show as error
      if (errorMessage.includes('Redirecting to Google')) {
        toast.loading('Redirecting to Google sign-in...', { id: toastId });
        return; // Don't set error state for redirect
      }
      
      setFormError(errorMessage);
      dispatch(setError(errorMessage));
      toast.error(errorMessage, { id: toastId });
    } finally {
      // Only set loading to false if we're not redirecting
      if (!localStorage.getItem('auth_redirect_pending')) {
        setLoading(false);
      }
    }
  };

  const handleRetry = () => {
    handleGoogleLogin();
  };
  
  const handleConnectionReset = async () => {
    setIsResettingConnection(true);
    const toastId = toast.loading('Resetting connection...');
    
    try {
      // Check if user is authenticated
      const isAuthenticated = !!auth.currentUser;
      console.log('Connection reset initiated. User authenticated:', isAuthenticated);
      
      // If we have a 400 Bad Request error, try a more aggressive approach
      if (formError.includes('400') || formError.includes('Bad Request')) {
        console.log('Detected 400 Bad Request error, using aggressive reset approach');
        
        // Clear Firebase-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('firestore')) {
            localStorage.removeItem(key);
          }
        });
        console.log('Cleared Firebase localStorage items');
        
        // Force token refresh if user is logged in
        if (auth.currentUser) {
          try {
            await auth.currentUser.getIdToken(true);
            console.log('Forced token refresh for 400 Bad Request error');
          } catch (tokenError) {
            console.warn('Token refresh failed during aggressive reset:', tokenError);
          }
        }
      }
      
      // Reset Firestore connection
      await resetFirestoreConnection();
      
      // Refresh token if user is logged in
      if (auth.currentUser) {
        try {
          const token = await refreshAuthToken();
          if (token) {
            console.log('Auth token refreshed successfully during connection reset');
          } else {
            console.warn('Auth token refresh returned null during connection reset');
            // Show a warning but don't treat as error
            toast.error('Auth token refresh may not have completed successfully', { 
              id: toastId,
              style: { backgroundColor: '#FFF9C4', color: '#5D4037' } // Warning style
            });
            return; // Exit early but don't show error
          }
        } catch (tokenError: Error | unknown) {
          const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
          console.error('Error refreshing auth token:', tokenError);
          toast.error(`Token refresh error: ${errorMessage}`, { id: toastId });
          return; // Exit early with error
        }
      }
      
      toast.success('Connection reset successfully', { id: toastId });
      
      // Clear any previous errors
      setFormError('');
      
      // If user is authenticated, try a test Firestore read to verify connection
      if (isAuthenticated) {
        try {
          // Import needed to avoid circular dependencies
          const { collection, doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../../config/firebase');
          
          const testRef = doc(collection(db, 'system_health_checks'), 'connection_test');
          await getDoc(testRef);
          console.log('Firestore test read successful after connection reset');
          
          // If we were previously having 400 Bad Request errors, suggest a page refresh
          if (formError.includes('400') || formError.includes('Bad Request')) {
            toast.success('Connection fixed! You may need to refresh the page for all features to work properly.', {
              duration: 6000 // Show for longer
            });
          }
        } catch (testError: Error | unknown) {
          const errorMessage = testError instanceof Error ? testError.message : 'Unknown error';
          console.warn('Firestore test read failed after connection reset:', errorMessage);
          
          // If we still have 400 Bad Request errors, suggest more drastic measures
          if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
            toast.error('Connection issues persist. Try refreshing the page or clearing your browser cache.', {
              duration: 6000 // Show for longer
            });
          }
        }
      }
    } catch (error: Error | unknown) {
      console.error('Error resetting connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to reset connection: ${errorMessage}`, { id: toastId });
    } finally {
      setIsResettingConnection(false);
    }
  };

  return (
    <motion.div 
      className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
      </div>
      
      {formError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{formError}</span>
          
          {(formError.includes('network') || formError.includes('connection') || formError.includes('404') || formError.includes('offline')) && (
            <button 
              onClick={handleRetry}
              className="ml-auto flex items-center text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <Button
          variant="default"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center relative"
        >
          {loading ? (
            <>
              <div className="absolute left-4 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </Button>
      </div>

      {/* Connection reset button - helps users fix Firestore connection issues */}
      <div className="mt-4 text-center">
        <button
          onClick={handleConnectionReset}
          disabled={isResettingConnection}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <WifiOff className="h-4 w-4 mr-1" />
          {isResettingConnection ? 'Resetting connection...' : 'Having connection issues? Click here'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
