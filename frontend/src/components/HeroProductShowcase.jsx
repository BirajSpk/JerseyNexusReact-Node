import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../utils/motion';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from './ui/ProfessionalIcon';
import { productAPI } from '../utils/api';
import { getImageUrl } from '../utils/helpers';

const HeroProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getFeaturedProducts();
        if (response.data.success) {
          const featuredProducts = response.data.data.products || [];
          
          // Process products for showcase
          const processedProducts = featuredProducts.slice(0, 6).map(product => {
            let processedImages = [];
            
            if (product.productImages && Array.isArray(product.productImages)) {
              processedImages = product.productImages.map(img => ({
                url: getImageUrl(img.url),
                altText: img.altText || product.name,
                isPrimary: img.isPrimary || false
              }));
            } else if (product.images) {
              try {
                const parsedImages = typeof product.images === 'string' 
                  ? JSON.parse(product.images) 
                  : product.images;
                if (Array.isArray(parsedImages)) {
                  processedImages = parsedImages.map(img => ({
                    url: getImageUrl(img.url),
                    altText: img.altText || product.name,
                    isPrimary: img.isPrimary || false
                  }));
                }
              } catch (e) {
                console.warn('Failed to parse product images:', e);
              }
            }

            return {
              ...product,
              images: processedImages,
              price: product.salePrice || product.price,
              originalPrice: product.price,
              rating: product.rating || 4.5
            };
          });
          
          setProducts(processedProducts);
        }
      } catch (error) {
        console.error('Error fetching products for showcase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto-cycle through products
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 4000); // 4 second intervals

    return () => clearInterval(interval);
  }, [products.length]);

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug || product.id}`);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  if (loading || products.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="aspect-square bg-white/20 rounded-xl mb-4"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-2/3 mb-4"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  const fallbackImage = '/images/placeholder-jersey.jpg';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 relative overflow-hidden">
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-white mb-1">Featured Product</h3>
        <p className="text-white/80 text-xs">Trending Now</p>
      </div>

      <AnimatePresence>
        <motion.div
          key={currentProduct.id}
          className="cursor-pointer transition-all duration-500 animate-fade-in"
          onClick={() => handleProductClick(currentProduct)}
        >
          {/* Product Image */}
          <div className="aspect-square bg-white/20 rounded-xl mb-3 overflow-hidden group">
            <img
              src={currentProduct.images[0]?.url || fallbackImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
          </div>

          {/* Product Info */}
          <div className="text-center">
            <h4 className="text-base font-semibold text-white mb-2 line-clamp-2">
              {currentProduct.name}
            </h4>

            {/* Rating */}
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(currentProduct.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-white/40'
                  }`}
                />
              ))}
              <span className="text-white/80 text-xs ml-1">
                ({currentProduct.rating})
              </span>
            </div>

            {/* Price */}
            <div className="mb-3">
              <span className="text-xl font-bold text-white">
                NPR {currentProduct.price?.toLocaleString()}
              </span>
              {currentProduct.originalPrice > currentProduct.price && (
                <span className="text-white/60 line-through ml-2 text-sm">
                  NPR {currentProduct.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(currentProduct);
              }}
              className="w-full bg-white text-primary font-semibold py-2.5 px-3 rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>View Product</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2">
        <button
          onClick={handlePrevious}
          className="bg-white/80 hover:bg-white backdrop-blur-md rounded-full p-2.5 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-2">
        <button
          onClick={handleNext}
          className="bg-white/80 hover:bg-white backdrop-blur-md rounded-full p-2.5 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 text-gray-700 hover:text-gray-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 border-2 ${
              index === currentIndex
                ? 'bg-white border-white shadow-lg'
                : 'bg-white/30 border-white/60 hover:bg-white/50 hover:border-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroProductShowcase;
