import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { X, Upload, Crop, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ onImageCropped, onClose, aspectRatio = 1 }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const hiddenFileInput = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setIsLoading(true);
    
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to crop image');
          setIsLoading(false);
          return;
        }
        
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        onImageCropped(file);
        setIsLoading(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
      setIsLoading(false);
    }
  }, [completedCrop, onImageCropped]);

  const handleFileInputClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Crop Profile Image</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!imageSrc ? (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Select an image to crop</p>
              <button
                onClick={handleFileInputClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Image
              </button>
              <input
                ref={hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={handleFileInputClick}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose Different Image
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={getCroppedImg}
                    disabled={!completedCrop || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cropping...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Crop & Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <input
                ref={hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;