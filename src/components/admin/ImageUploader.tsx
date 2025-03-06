import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Button from '../ui/Button';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImageUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle file upload to Firebase Storage
  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      
      const storage = getStorage();
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `workshop_images/${timestamp}_${file.name}`);
      
      // Create upload task with metadata to help with CORS
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'Access-Control-Allow-Origin': '*'
        }
      };
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      // Listen for upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try using the URL input option instead.');
          setUploading(false);
          // Show URL input as fallback
          setShowUrlInput(true);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setPreviewUrl(downloadUrl);
            onImageUploaded(downloadUrl);
            setSuccess(true);
            setUploading(false);
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (err) {
            console.error('Error getting download URL:', err);
            setError('Failed to get image URL. Please try using the URL input option instead.');
            setUploading(false);
            // Show URL input as fallback
            setShowUrlInput(true);
          }
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError('An unexpected error occurred. Please try using the URL input option instead.');
      setUploading(false);
      // Show URL input as fallback
      setShowUrlInput(true);
    }
  };

  // Handle manual URL input
  const handleUrlSubmit = () => {
    if (!manualUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(manualUrl);
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }
    
    setPreviewUrl(manualUrl);
    onImageUploaded(manualUrl);
    setSuccess(true);
    setShowUrlInput(false);
    setManualUrl('');
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
    if (!currentImageUrl) {
      setPreviewUrl(null);
    } else {
      setPreviewUrl(currentImageUrl);
    }
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    // Use a placeholder image instead
    target.src = 'https://via.placeholder.com/300?text=Image+Not+Available';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Workshop Image
        </h3>
        <div className="flex space-x-2">
          {previewUrl && !file && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-forest-green dark:hover:text-moss-green"
            >
              Change Image
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-forest-green dark:hover:text-moss-green"
          >
            <LinkIcon size={14} className="mr-1" />
            {showUrlInput ? 'Hide URL Input' : 'Use Image URL'}
          </Button>
        </div>
      </div>
      
      {/* URL Input */}
      {showUrlInput && (
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green dark:bg-gray-700 dark:border-gray-600"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              className="rounded-l-none bg-forest-green hover:bg-spring-garden text-white"
            >
              Use URL
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a direct link to an image (JPG, PNG, GIF)
          </p>
        </div>
      )}
      
      {/* Preview Area */}
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
            onError={handleImageError}
          />
          {file && (
            <button
              type="button"
              onClick={handleClearFile}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              title="Clear selection"
            >
              <X size={20} className="text-gray-700" />
            </button>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-forest-green dark:hover:border-moss-green bg-gray-50 dark:bg-gray-800"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={40} className="text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
            Click to upload an image
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            JPG, PNG or GIF (max. 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center text-red-500 dark:text-red-400 text-sm mt-2">
          <AlertCircle size={16} className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="flex items-center text-green-500 dark:text-green-400 text-sm mt-2">
          <Check size={16} className="mr-1 flex-shrink-0" />
          <span>Image set successfully!</span>
        </div>
      )}
      
      {/* Upload Button and Progress */}
      {file && !uploading && !success && (
        <Button 
          type="button" 
          onClick={handleUpload}
          className="w-full bg-forest-green hover:bg-spring-garden text-white"
        >
          Upload Image
        </Button>
      )}
      
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-forest-green h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 