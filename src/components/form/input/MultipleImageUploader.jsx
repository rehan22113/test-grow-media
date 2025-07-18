'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { getCloudinaryUploadUrl, cloudinaryConfig } from '@/lib/cloudinary';
import { TrashBinIcon, ChevronUpIcon, ChevronDownIcon } from '@/icons';

const MultipleImageUploader = ({ onImagesUpdate, images = [], className, showDescription = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  // Handle file upload
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
    }
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
    }
  }, []);

  const uploadFile = async (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      // Upload to Cloudinary
      const response = await fetch(
        getCloudinaryUploadUrl(),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Add the new image to the list with a default priority
      const newImage = {
        url: data.secure_url,
        title: file.name,
        description: '',
        priority: images.length + 1
      };

      // Call the callback with the updated images array
      if (onImagesUpdate) {
        onImagesUpdate([...images, newImage]);
      }
    } catch (err) {
      console.error('Error uploading to Cloudinary:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    
    // Reorder priorities after removal
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      priority: idx + 1
    }));
    
    onImagesUpdate(reorderedImages);
  };

  const handlePriorityChange = (index, newPriority) => {
    if (newPriority < 1 || newPriority > images.length) return;
    
    const updatedImages = [...images];
    const imageToMove = updatedImages[index];
    
    // Remove the image from its current position
    updatedImages.splice(index, 1);
    
    // Insert it at the new position
    updatedImages.splice(newPriority - 1, 0, imageToMove);
    
    // Update all priorities
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      priority: idx + 1
    }));
    
    onImagesUpdate(reorderedImages);
  };

  const handleTitleChange = (index, title) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], title };
    onImagesUpdate(updatedImages);
  };

  const handleDescriptionChange = (index, description) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], description };
    onImagesUpdate(updatedImages);
  };

  const movePriorityUp = (index) => {
    if (index === 0) return; // Already at the top
    handlePriorityChange(index, index);
  };

  const movePriorityDown = (index) => {
    if (index === images.length - 1) return; // Already at the bottom
    handlePriorityChange(index, index + 2);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drag and drop area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-700'} ${isUploading ? 'opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('multiFileInput').click()}
      >
        <input
          id="multiFileInput"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isUploading}
          multiple
        />

        <div className="py-4">
          {isUploading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click or drag and drop images
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-error-500 dark:text-error-400">{error}</p>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Images</h4>
          
          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image preview */}
                  <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                    <Image 
                      src={image.url} 
                      alt={image.title || `Image ${index + 1}`} 
                      fill 
                      className="object-cover rounded-md" 
                    />
                  </div>
                  
                  {/* Image details */}
                  <div className="flex-grow space-y-3">
                    <div>
                      <label htmlFor={`image-title-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Image Title
                      </label>
                      <input
                        type="text"
                        id={`image-title-${index}`}
                        value={image.title || ''}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    </div>
                    
                    {showDescription && (
                      <div>
                        <label htmlFor={`image-desc-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image Description
                        </label>
                        <textarea
                          id={`image-desc-${index}`}
                          value={image.description || ''}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                        />
                      </div>
                    )}
                    
                    {/* Special buttons for the last priority image in Section 1 (when showDescription is false) */}
                    {!showDescription && image.priority === images.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        >
                          + Add Download 5x5
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        >
                          + Add Download 10x10
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        >
                          + Add Download 15x15
                        </button>
                      </div>
                    )}
                    
                    {/* Regular action buttons for non-last priority images or in Section 2 */}
                    {(showDescription || image.priority !== images.length) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        >
                          + add image to print
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        >
                          + add pdf file for download
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Priority and actions */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{image.priority}</span>
                      <div className="flex flex-col">
                        <button 
                          type="button" 
                          onClick={() => movePriorityUp(index)}
                          disabled={index === 0}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => movePriorityDown(index)}
                          disabled={index === images.length - 1}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(index)}
                      className="text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                    >
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUploader;