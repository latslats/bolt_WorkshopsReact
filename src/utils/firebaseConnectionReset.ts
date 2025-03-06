/**
 * This file contains utilities for resetting Firestore connections
 * It's separated from other files to avoid circular dependencies
 */

import { Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Track if a reset is in progress to prevent multiple simultaneous resets
let resetInProgress = false;

/**
 * Resets a Firestore connection by terminating the client
 * This can help resolve 400 Bad Request errors and offline client issues
 */
export const resetFirestoreClient = async (db: Firestore): Promise<void> => {
  // If a reset is already in progress, don't start another one
  if (resetInProgress) {
    console.log('Firestore reset already in progress, skipping duplicate reset');
    return;
  }
  
  resetInProgress = true;
  
  try {
    console.log('Resetting Firestore connection');
    
    // First try to disable the network to clear any pending operations
    try {
      await disableNetwork(db);
      console.log('Network disabled for reset');
    } catch (disableError) {
      console.warn('Error disabling network:', disableError);
      // Continue with reset even if disabling fails
    }
    
    // Small delay to allow operations to settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Terminate the Firestore client to clear any stale connections
    // @ts-ignore - Accessing internal Firebase property to reset connection
    if (db && db._delegate && db._delegate._firestoreClient) {
      console.log('Terminating Firestore client');
      // @ts-ignore
      await db._delegate._firestoreClient.terminate();
      
      // Small delay to allow connection to fully terminate
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Firestore client terminated');
    } else {
      console.log('No Firestore client to terminate, skipping termination step');
    }
    
    // Re-enable the network after termination
    try {
      await enableNetwork(db);
      console.log('Network re-enabled after reset');
    } catch (enableError) {
      console.warn('Error re-enabling network:', enableError);
      
      // If re-enabling fails, try again after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await enableNetwork(db);
        console.log('Network re-enabled after second attempt');
      } catch (secondEnableError) {
        console.error('Failed to re-enable network after second attempt:', secondEnableError);
      }
    }
    
    console.log('Firestore connection reset complete');
  } catch (error) {
    console.error('Error during Firestore connection reset:', error);
    
    // Try to re-enable network as a last resort
    try {
      await enableNetwork(db);
      console.log('Network re-enabled after error');
    } catch (finalError) {
      console.error('Failed to re-enable network after error:', finalError);
    }
  } finally {
    // Always mark reset as complete, even if there was an error
    resetInProgress = false;
  }
};

/**
 * Checks if the browser is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Safely enables the Firestore network connection
 */
export const safelyEnableNetwork = async (db: Firestore): Promise<void> => {
  if (!isOnline()) {
    console.log('Browser is offline, skipping network enable');
    return;
  }
  
  try {
    await enableNetwork(db);
    console.log('Network enabled successfully');
  } catch (error) {
    console.error('Error enabling network:', error);
  }
}; 