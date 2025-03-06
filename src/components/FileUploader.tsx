import React, { useState, useRef, ChangeEvent } from 'react';
import { uploadFile, generateUniqueFilePath, UploadProgress } from '../services/storageService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface FileUploaderProps {
  directory: string;
  onUploadComplete?: (downloadURL: string, fileName: string) => void;
  onUploadError?: (error: Error) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  buttonText?: string;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  directory,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = 'image/*,application/pdf',
  maxFileSizeMB = 5,
  buttonText = 'Upload File',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size of ${maxFileSizeMB}MB`);
      if (onUploadError) {
        onUploadError(new Error(`File size exceeds the maximum allowed size of ${maxFileSizeMB}MB`));
      }
      return;
    }
    
    // Reset states
    setError(null);
    setSuccessMessage(null);
    setIsUploading(true);
    
    try {
      // Generate a unique path for the file
      const userId = user?.id || 'anonymous';
      const filePath = generateUniqueFilePath(`${directory}/${userId}`, file.name);
      
      // Upload the file with progress tracking
      const downloadURL = await uploadFile(
        file,
        filePath,
        {
          customMetadata: {
            uploadedBy: userId,
            originalName: file.name,
          }
        },
        (progress) => {
          setUploadProgress(progress);
          
          // Handle upload completion within the progress callback
          if (progress.state === 'success' && progress.downloadURL) {
            setIsUploading(false);
            setSuccessMessage(`File uploaded successfully!`);
            
            if (onUploadComplete) {
              onUploadComplete(progress.downloadURL, file.name);
            }
          }
          
          // Handle upload error within the progress callback
          if (progress.state === 'error' && progress.error) {
            setIsUploading(false);
            setError(`Upload failed: ${progress.error.message}`);
            
            if (onUploadError) {
              onUploadError(progress.error);
            }
          }
        }
      );
      
      // This will only execute if the progress callback doesn't handle completion
      if (downloadURL && !successMessage) {
        setIsUploading(false);
        setSuccessMessage(`File uploaded successfully!`);
        
        if (onUploadComplete) {
          onUploadComplete(downloadURL, file.name);
        }
      }
    } catch (err: any) {
      setIsUploading(false);
      const errorMessage = err.message || 'An unknown error occurred during upload';
      setError(`Upload failed: ${errorMessage}`);
      
      if (onUploadError) {
        onUploadError(err);
      }
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="file-uploader">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      
      {/* Upload button */}
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`bg-forest-green hover:bg-spring-garden text-white font-bold py-2 px-4 rounded transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {isUploading ? 'Uploading...' : buttonText}
      </button>
      
      {/* Progress bar */}
      {isUploading && uploadProgress && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-moss-green h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {uploadProgress.progress.toFixed(0)}% - {(uploadProgress.bytesTransferred / 1024 / 1024).toFixed(2)}MB of {(uploadProgress.totalBytes / 1024 / 1024).toFixed(2)}MB
          </p>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="mt-2 text-green-600 text-sm">{successMessage}</div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
      
      {/* File type information */}
      <p className="text-xs text-gray-500 mt-2">
        Accepted file types: {acceptedFileTypes.replace(/,/g, ', ')}
        <br />
        Maximum file size: {maxFileSizeMB}MB
      </p>
    </div>
  );
};

export default FileUploader; 