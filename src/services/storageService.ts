import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  listAll, 
  deleteObject,
  uploadString,
  getMetadata,
  updateMetadata,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Interface for upload progress tracking
 */
export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
  bytesTransferred: number;
  totalBytes: number;
  downloadURL?: string;
  error?: Error;
}

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  fullPath: string;
  downloadURL: string;
  createdAt?: string;
  updatedAt?: string;
  customMetadata?: Record<string, string>;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param file - The file to upload
 * @param path - The storage path where the file should be stored
 * @param metadata - Optional metadata for the file
 * @param progressCallback - Optional callback for tracking upload progress
 * @returns Promise resolving to the download URL
 */
export const uploadFile = (
  file: File,
  path: string,
  metadata?: UploadMetadata,
  progressCallback?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Prepare metadata with content type and additional info
      const fileMetadata: UploadMetadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          size: file.size.toString(),
          createdAt: new Date().toISOString(),
          ...metadata?.customMetadata
        },
        ...metadata
      };
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file, fileMetadata);
      
      // Set up progress monitoring
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) {
            progressCallback({
              progress,
              state: snapshot.state,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          }
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          if (progressCallback) {
            progressCallback({
              progress: 0,
              state: 'error',
              bytesTransferred: 0,
              totalBytes: file.size,
              error
            });
          }
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            if (progressCallback) {
              progressCallback({
                progress: 100,
                state: 'success',
                bytesTransferred: file.size,
                totalBytes: file.size,
                downloadURL
              });
            }
            
            console.log('Upload completed successfully. Download URL:', downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      reject(error);
    }
  });
};

/**
 * Upload a string (like base64 data) to Firebase Storage
 * @param dataString - The string data to upload
 * @param path - The storage path where the file should be stored
 * @param format - The format of the string ('raw', 'base64', 'base64url', or 'data_url')
 * @param metadata - Optional metadata for the file
 * @returns Promise resolving to the download URL
 */
export const uploadStringData = async (
  dataString: string,
  path: string,
  format: 'raw' | 'base64' | 'base64url' | 'data_url',
  metadata?: UploadMetadata
): Promise<string> => {
  try {
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Prepare metadata with additional info
    const fileMetadata: UploadMetadata = {
      customMetadata: {
        format,
        createdAt: new Date().toISOString(),
        ...metadata?.customMetadata
      },
      ...metadata
    };
    
    // Upload the string
    await uploadString(storageRef, dataString, format, fileMetadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('String upload completed successfully. Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading string data:', error);
    throw error;
  }
};

/**
 * Download a file from Firebase Storage
 * @param path - The storage path of the file to download
 * @returns Promise resolving to the download URL
 */
export const getFileDownloadURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error);
    throw error;
  }
};

/**
 * Get metadata for a file in Firebase Storage
 * @param path - The storage path of the file
 * @returns Promise resolving to the file metadata
 */
export const getFileMetadata = async (path: string): Promise<FileMetadata> => {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType || 'application/octet-stream',
      fullPath: metadata.fullPath,
      downloadURL,
      createdAt: metadata.customMetadata?.createdAt,
      updatedAt: metadata.customMetadata?.updatedAt,
      customMetadata: metadata.customMetadata
    };
  } catch (error) {
    console.error(`Error getting metadata for ${path}:`, error);
    throw error;
  }
};

/**
 * Update metadata for a file in Firebase Storage
 * @param path - The storage path of the file
 * @param metadata - The metadata to update
 * @returns Promise resolving to the updated metadata
 */
export const updateFileMetadata = async (
  path: string,
  metadata: Partial<UploadMetadata>
): Promise<FileMetadata> => {
  try {
    const storageRef = ref(storage, path);
    
    // Add updated timestamp
    const updatedMetadata: UploadMetadata = {
      ...metadata,
      customMetadata: {
        ...metadata.customMetadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    // Update the metadata
    const newMetadata = await updateMetadata(storageRef, updatedMetadata);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: newMetadata.name,
      size: newMetadata.size,
      contentType: newMetadata.contentType || 'application/octet-stream',
      fullPath: newMetadata.fullPath,
      downloadURL,
      createdAt: newMetadata.customMetadata?.createdAt,
      updatedAt: newMetadata.customMetadata?.updatedAt,
      customMetadata: newMetadata.customMetadata
    };
  } catch (error) {
    console.error(`Error updating metadata for ${path}:`, error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param path - The storage path of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log(`File ${path} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error);
    throw error;
  }
};

/**
 * List all files in a directory in Firebase Storage
 * @param path - The storage path of the directory
 * @returns Promise resolving to an array of file metadata
 */
export const listFiles = async (path: string): Promise<FileMetadata[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    // Get metadata and download URL for each file
    const filePromises = result.items.map(async (itemRef) => {
      try {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        return {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType || 'application/octet-stream',
          fullPath: metadata.fullPath,
          downloadURL,
          createdAt: metadata.customMetadata?.createdAt,
          updatedAt: metadata.customMetadata?.updatedAt,
          customMetadata: metadata.customMetadata
        };
      } catch (itemError) {
        console.warn(`Error getting metadata for ${itemRef.fullPath}:`, itemError);
        // Return partial metadata if we can't get full details
        return {
          name: itemRef.name,
          size: 0,
          contentType: 'unknown',
          fullPath: itemRef.fullPath,
          downloadURL: ''
        };
      }
    });
    
    return await Promise.all(filePromises);
  } catch (error) {
    console.error(`Error listing files in ${path}:`, error);
    throw error;
  }
};

/**
 * Check if a file exists in Firebase Storage
 * @param path - The storage path of the file
 * @returns Promise resolving to a boolean indicating if the file exists
 */
export const fileExists = async (path: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, path);
    await getMetadata(storageRef);
    return true;
  } catch (error: any) {
    // Check if the error is because the file doesn't exist
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    // For other errors, rethrow
    console.error(`Error checking if file ${path} exists:`, error);
    throw error;
  }
};

/**
 * Generate a unique file path for uploading
 * @param directory - The directory to upload to
 * @param fileName - The original file name
 * @returns A unique file path
 */
export const generateUniqueFilePath = (directory: string, fileName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  
  // Clean the file name to remove special characters
  const cleanName = fileName
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  
  return `${directory}/${cleanName}_${timestamp}_${randomString}.${extension}`;
};

export default {
  uploadFile,
  uploadStringData,
  getFileDownloadURL,
  getFileMetadata,
  updateFileMetadata,
  deleteFile,
  listFiles,
  fileExists,
  generateUniqueFilePath
}; 