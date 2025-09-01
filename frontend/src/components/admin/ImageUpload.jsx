import React, { useState, useRef } from 'react';
import { motion } from '../../utils/motion.jsx';
import { Upload, X, Image as ImageIcon, Loader } from '../ui/ProfessionalIcon';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 1, 
  label = "Upload Images",
  accept = "image/*",
  maxSizeInMB = 5 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select only image files');
      return false;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error(`File size must be less than ${maxSizeInMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} image${maxImages > 1 ? 's' : ''}`);
      return;
    }

    // Validate all files first
    for (const file of fileArray) {
      if (!validateFile(file)) {
        return;
      }
    }

    setUploading(true);

    try {
      const newImages = [];
      
      for (const file of fileArray) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Create image object
        const imageObj = {
          id: Date.now() + Math.random(), // Temporary ID
          file: file,
          preview: previewUrl,
          name: file.name,
          size: file.size,
          isNew: true
        };
        
        newImages.push(imageObj);
      }

      // Update parent component
      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added successfully`);
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // Clean up preview URLs for removed images
    const removedImage = images.find(img => img.id === imageId);
    if (removedImage && removedImage.preview && removedImage.isNew) {
      URL.revokeObjectURL(removedImage.preview);
    }
    
    onImagesChange(updatedImages);
    toast.success('Image removed');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {maxImages > 1 && `(Max ${maxImages})`}
      </label>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxImages > 1}
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Processing images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Drag and drop images here, or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSizeInMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image.preview || image.url || image}
                  alt={image.name || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4K';
                  }}
                />
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Image Info */}
              <div className="mt-2">
                <p className="text-xs text-gray-600 truncate">
                  {image.name || `Image ${index + 1}`}
                </p>
                {image.size && (
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Upload Progress */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.length} of {maxImages} image{maxImages > 1 ? 's' : ''} uploaded
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
