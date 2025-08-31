import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Zap
} from './ui/ProfessionalIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product is out of stock!');
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      // Add to cart first
      dispatch(addToCart({ product, quantity: 1 }));
      // Navigate to checkout
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/checkout');
      toast.success('Redirecting to checkout...');
    } else {
      toast.error('Product is out of stock!');
    }
  };

  const handleViewProduct = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/products/${product.slug}`);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStockStatus = (stock) => {
    if (stock > 10) {
      return { text: 'In Stock', className: 'bg-accent/10 text-accent' };
    } else if (stock > 0) {
      return { text: 'Low Stock', className: 'bg-secondary/10 text-secondary' };
    } else {
      return { text: 'Out of Stock', className: 'bg-danger/10 text-danger' };
    }
  };

  const stockStatus = getStockStatus(product.stock || 0);
  const discountPercentage = product.salePrice && product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Parse images if they're stored as JSON string
  const productImages = (() => {
    try {
      return product.images ? JSON.parse(product.images) : [];
    } catch {
      return [];
    }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleViewProduct}
      className={`bg-white rounded-lg shadow-soft overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
        viewMode === 'list' ? 'flex' : 'flex flex-col h-full'
      }`}
    >
      {/* Image Container */}
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'} overflow-hidden`}>
        <img
          src={productImages[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pjwvc3ZnPg=='}
          alt={productImages[0]?.altText || product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Prevent infinite loop by checking if we're already showing the fallback
            if (!e.target.src.includes('data:image')) {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTc1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pgo8L3N2Zz4K';
            }
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.featured && (
            <span className="bg-accent text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-danger text-white px-2 py-1 rounded text-xs font-medium">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
            className="bg-white text-dark p-3 rounded-full hover:bg-neutral transition-colors shadow-lg"
            title="Quick View"
          >
            <Eye className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleWishlist}
            className={`bg-white p-3 rounded-full hover:bg-neutral transition-colors shadow-lg ${
              isInWishlist ? 'text-red-500' : 'text-dark'
            }`}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
      
      {/* Content */}
      <div className={`p-4 flex flex-col h-full ${viewMode === 'list' ? 'flex-1' : ''}`}>
        {/* Product Name */}
        <h3 className="font-semibold text-dark line-clamp-2 hover:text-primary transition-colors mb-2 text-sm sm:text-base">
          {product.name}
        </h3>
        
        {/* Category */}
        {product.category && (
          <p className="text-sm text-muted mb-2 font-medium">{product.category.name}</p>
        )}

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating || 0)}
          </div>
          <span className="text-sm text-muted ml-2">
            ({product.reviews?.length || 0})
          </span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-dark">
              NPR {(product.salePrice || product.price)?.toLocaleString()}
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm text-muted line-through">
                NPR {product.price?.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>
        
        {/* Description (List view only) */}
        {viewMode === 'list' && (
          <p className="text-sm text-muted mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="mt-auto pt-3">
          {product.stock === 0 ? (
            /* Out of Stock Button */
            <motion.button
              disabled
              className="w-full py-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center space-x-2 border border-gray-200"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Out of Stock</span>
            </motion.button>
          ) : (
            /* In Stock Buttons */
            <div className="space-y-2">
              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-2.5 rounded-lg font-semibold text-sm bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </motion.button>

              {/* Buy Now Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="w-full py-2.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 active:bg-primary/80 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span>Buy Now</span>
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Additional Info (List view only) */}
        {viewMode === 'list' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Stock: {product.stock}</span>
              {product.category && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  {product.category.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;