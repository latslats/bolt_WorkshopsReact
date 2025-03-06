import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import FileUploader from '../components/FileUploader';
import FileGallery from '../components/FileGallery';
import { FileMetadata } from '../services/storageService';

const FilesPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Handle file upload completion
  const handleUploadComplete = (downloadURL: string, fileName: string) => {
    setUploadSuccess(`File "${fileName}" uploaded successfully!`);
    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000);
  };
  
  // Handle file selection from gallery
  const handleFileSelect = (file: FileMetadata) => {
    setSelectedFile(file);
  };
  
  // Handle file deletion
  const handleFileDelete = (filePath: string) => {
    // If the deleted file is the selected file, clear the selection
    if (selectedFile && selectedFile.fullPath === filePath) {
      setSelectedFile(null);
    }
  };
  
  // Close file preview
  const closeFilePreview = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-forest-green mb-6">Workshop Files</h1>
      
      {!isAuthenticated ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Please sign in</p>
          <p>You need to sign in to upload and manage your files.</p>
        </div>
      ) : (
        <>
          {/* Success message */}
          {uploadSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 animate-fade-in">
              {uploadSuccess}
            </div>
          )}
          
          {/* File upload section */}
          <div className="bg-white-linen rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-forest-green mb-4">Upload Files</h2>
            <p className="text-gray-600 mb-4">
              Upload files for your workshop projects. You can upload images, PDFs, and other documents.
            </p>
            
            <div className="mt-4">
              <FileUploader
                directory={`users/${user?.id}/workshop-files`}
                onUploadComplete={handleUploadComplete}
                acceptedFileTypes="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                maxFileSizeMB={5}
                buttonText="Upload Workshop File"
              />
            </div>
          </div>
          
          {/* File galleries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User files */}
            <div className="bg-white-linen rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-forest-green mb-4">Your Files</h2>
              <FileGallery
                directory={`users/${user?.id}/workshop-files`}
                onFileSelect={handleFileSelect}
                onFileDelete={handleFileDelete}
              />
            </div>
            
            {/* Workshop materials (read-only) */}
            <div className="bg-white-linen rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-forest-green mb-4">Workshop Materials</h2>
              <p className="text-gray-600 mb-4">
                These are materials provided by workshop instructors.
              </p>
              <FileGallery
                directory="workshops/materials"
                onFileSelect={handleFileSelect}
                showDeleteButton={false}
              />
            </div>
          </div>
          
          {/* File preview modal */}
          {selectedFile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <button
                    onClick={closeFilePreview}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Modal body */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
                  {selectedFile.contentType.startsWith('image/') ? (
                    <img
                      src={selectedFile.downloadURL}
                      alt={selectedFile.name}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  ) : selectedFile.contentType.includes('pdf') ? (
                    <iframe
                      src={`${selectedFile.downloadURL}#toolbar=0`}
                      title={selectedFile.name}
                      className="w-full h-[70vh]"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {selectedFile.contentType.includes('pdf') ? '📄' :
                         selectedFile.contentType.includes('word') ? '📝' :
                         selectedFile.contentType.includes('text') ? '📃' : '📁'}
                      </div>
                      <p>This file type cannot be previewed.</p>
                      <a
                        href={selectedFile.downloadURL}
                        download={selectedFile.name}
                        className="mt-4 inline-block bg-forest-green hover:bg-spring-garden text-white font-bold py-2 px-4 rounded transition-colors"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Modal footer */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>Type: {selectedFile.contentType}</span>
                    <span>•</span>
                    <span>Size: {(selectedFile.size / 1024).toFixed(2)} KB</span>
                    {selectedFile.createdAt && (
                      <>
                        <span>•</span>
                        <span>Uploaded: {new Date(selectedFile.createdAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilesPage; 