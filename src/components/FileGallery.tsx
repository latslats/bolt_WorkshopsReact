import React, { useState, useEffect } from 'react';
import { listFiles, deleteFile, FileMetadata } from '../services/storageService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface FileGalleryProps {
  directory: string;
  onFileDelete?: (filePath: string) => void;
  onFileSelect?: (file: FileMetadata) => void;
  showDeleteButton?: boolean;
  className?: string;
}

const FileGallery: React.FC<FileGalleryProps> = ({
  directory,
  onFileDelete,
  onFileSelect,
  showDeleteButton = true,
  className = '',
}) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // Load files when the component mounts or directory changes
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If user is not authenticated and not viewing public directory, don't load files
        if (!user && !directory.startsWith('public')) {
          setFiles([]);
          setLoading(false);
          return;
        }
        
        // For user-specific directories, include user ID in path
        let path = directory;
        if (directory.includes('{userId}') && user) {
          path = directory.replace('{userId}', user.id);
        }
        
        const filesList = await listFiles(path);
        setFiles(filesList);
      } catch (err: any) {
        console.error('Error loading files:', err);
        setError(`Failed to load files: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [directory, user]);
  
  // Handle file deletion
  const handleDelete = async (file: FileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }
    
    setIsDeleting(file.fullPath);
    
    try {
      await deleteFile(file.fullPath);
      
      // Update the files list
      setFiles(prevFiles => prevFiles.filter(f => f.fullPath !== file.fullPath));
      
      if (onFileDelete) {
        onFileDelete(file.fullPath);
      }
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(`Failed to delete file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Handle file selection
  const handleSelect = (file: FileMetadata) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  // Determine if the file is an image
  const isImage = (file: FileMetadata) => {
    return file.contentType.startsWith('image/');
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (err) {
      return dateString;
    }
  };
  
  // Get file icon based on content type
  const getFileIcon = (file: FileMetadata) => {
    if (isImage(file)) {
      return '🖼️';
    } else if (file.contentType.includes('pdf')) {
      return '📄';
    } else if (file.contentType.includes('word')) {
      return '📝';
    } else if (file.contentType.includes('text')) {
      return '📃';
    } else {
      return '📁';
    }
  };
  
  return (
    <div className={`file-gallery ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Files</h3>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-forest-green"></div>
          <p className="mt-2 text-gray-600">Loading files...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && files.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No files found in this directory.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.fullPath}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* File preview */}
            <div 
              className="h-40 bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={() => handleSelect(file)}
            >
              {isImage(file) ? (
                <img
                  src={file.downloadURL}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-4xl">{getFileIcon(file)}</div>
              )}
            </div>
            
            {/* File info */}
            <div className="p-3">
              <h4 className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(file.size)} • {file.contentType.split('/')[1]}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Uploaded: {formatDate(file.createdAt)}
              </p>
              
              {/* Actions */}
              <div className="flex mt-3 space-x-2">
                <a
                  href={file.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-moss-green hover:bg-spring-garden text-white text-sm py-1 px-2 rounded text-center transition-colors"
                >
                  View
                </a>
                <a
                  href={file.downloadURL}
                  download={file.name}
                  className="flex-1 bg-lemon-yellow hover:bg-yellow-400 text-charcoal text-sm py-1 px-2 rounded text-center transition-colors"
                >
                  Download
                </a>
                {showDeleteButton && (isAdmin || directory.includes(user?.id || '')) && (
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={isDeleting === file.fullPath}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded text-center transition-colors disabled:opacity-50"
                  >
                    {isDeleting === file.fullPath ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileGallery; 