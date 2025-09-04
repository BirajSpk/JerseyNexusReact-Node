import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Star, 
  Edit3, 
  Trash2, 
  Move, 
  Image as ImageIcon,
  Loader,
  Check,
  AlertCircle
} from 'lucide-react';
import { productAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ProductImageManager = ({ 
  productId, 
  images = [], 
  onImagesUpdate, 
  maxImages = 10,
  isEditing = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [draggedImage, setDraggedImage] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (files) => {
    if (!productId) {
      toast.error('Product must be saved before uploading images');
      return;
    }

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await productAPI.uploadProductImages(productId, formData);
      
      if (response.data.success) {
        toast.success(`${validFiles.length} image(s) uploaded successfully`);
        onImagesUpdate(response.data.data.product.productImages);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await productAPI.deleteProductImage(productId, imageId);
      toast.success('Image deleted successfully');
      
      // Update local state
      const updatedImages = images.filter(img => img.id !== imageId);
      onImagesUpdate(updatedImages);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await productAPI.updateProductImage(productId, imageId, { isPrimary: true });
      toast.success('Primary image updated');
      
      // Update local state
      const updatedImages = images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }));
      onImagesUpdate(updatedImages);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update primary image');
    }
  };

  const handleUpdateAltText = async (imageId, altText) => {
    try {
      await productAPI.updateProductImage(productId, imageId, { altText });
      toast.success('Alt text updated');
      
      // Update local state
      const updatedImages = images.map(img => 
        img.id === imageId ? { ...img, altText } : img
      );
      onImagesUpdate(updatedImages);
      setEditingImage(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update alt text');
    }
  };

  const handleDragStart = (e, image) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetImage) => {
    e.preventDefault();
    
    if (!draggedImage || draggedImage.id === targetImage.id) {
      setDraggedImage(null);
      return;
    }

    try {
      // Create new order array
      const imageOrders = images.map((img, index) => {
        if (img.id === draggedImage.id) {
          return { imageId: img.id, sortOrder: targetImage.sortOrder };
        }
        if (img.id === targetImage.id) {
          return { imageId: img.id, sortOrder: draggedImage.sortOrder };
        }
        return { imageId: img.id, sortOrder: img.sortOrder };
      });

      await productAPI.reorderProductImages(productId, imageOrders);
      
      // Update local state
      const updatedImages = [...images];
      const draggedIndex = updatedImages.findIndex(img => img.id === draggedImage.id);
      const targetIndex = updatedImages.findIndex(img => img.id === targetImage.id);
      
      [updatedImages[draggedIndex], updatedImages[targetIndex]] = 
      [updatedImages[targetIndex], updatedImages[draggedIndex]];
      
      onImagesUpdate(updatedImages);
      toast.success('Images reordered successfully');
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('Failed to reorder images');
    } finally {
      setDraggedImage(null);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && isEditing && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEvents}
          onDragLeave={handleDragEvents}
          onDragOver={handleDragEvents}
          onDrop={handleFileDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Drag and drop images here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP up to 5MB each
              </p>
            </div>
          )}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
                  draggable={isEditing}
                  onDragStart={(e) => handleDragStart(e, image)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, image)}
                >
                  {/* Image */}
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.altText || 'Product image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x200/e5e7eb/6b7280?text=Error';
                      }}
                    />
                  </div>

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </span>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        {!image.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(image.id)}
                            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingImage(image)}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                          title="Edit alt text"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag Handle */}
                  {isEditing && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Move className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Alt Text Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Image Alt Text</h3>
            <input
              type="text"
              defaultValue={editingImage.altText || ''}
              placeholder="Enter alt text for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateAltText(editingImage.id, e.target.value);
                } else if (e.key === 'Escape') {
                  setEditingImage(null);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const input = e.target.parentElement.parentElement.querySelector('input');
                  handleUpdateAltText(editingImage.id, input.value);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No images uploaded yet</p>
          {!isEditing && (
            <p className="text-sm">Save the product first to upload images</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
