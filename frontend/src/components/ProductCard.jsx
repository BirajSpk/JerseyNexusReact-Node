import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../utils/motion.jsx';
import { Star, ShoppingCart, Heart, Eye, Zap } from './ui/ProfessionalIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

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
      dispatch(addToCart({ product, quantity: 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/checkout');
      toast.success('Redirecting to checkout...');
    } else {
      toast.error('Product is out of stock!');
    }
  };

  const handleViewProduct = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/products/${product.id}`);
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
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { text: 'In Stock', className: 'bg-accent/10 text-accent' };
    if (stock > 0) return { text: 'Low Stock', className: 'bg-secondary/10 text-secondary' };
    return { text: 'Out of Stock', className: 'bg-danger/10 text-danger' };
  };

  const stockStatus = getStockStatus(product.stock || 0);
  const discountPercentage =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const productImages = (() => {
    // Handle new image format (array of image objects)
    if (product.productImages && Array.isArray(product.productImages)) {
      return product.productImages;
    }
    // Handle legacy format (JSON string) - fallback
    try {
      return product.images ? JSON.parse(product.images) : [];
    } catch {
      return [];
    }
  })();

  const fallbackImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pjwvc3ZnPg==';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleViewProduct}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer
        ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col h-full'}
      `}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square w-full'
        }`}
      >
        <img
          src={productImages[0]?.url || fallbackImage}
          alt={productImages[0]?.altText || product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
          {product.featured && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              ⭐ Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              -{discountPercentage}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              🆕 New
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.className} backdrop-blur-sm`}
          >
            {stockStatus.text}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
            className="bg-white p-3 rounded-full shadow-lg"
            title="Quick View"
          >
            <Eye className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleWishlist}
            className={`bg-white p-3 rounded-full shadow-lg ${isInWishlist ? 'text-red-500' : 'text-dark'}`}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 flex flex-col justify-between ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div>
          {product.category && (
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-gray-100 mb-2">
              {product.category.name}
            </span>
          )}

          <h3 className="font-semibold text-gray-900 mb-2 text-base line-clamp-2">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating || 0)}
              <span className="text-sm text-gray-500 ml-1">({product.rating || 0})</span>
            </div>
            <span className="text-xs text-gray-400">{product.reviews?.length || 0} reviews</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-xl font-bold text-gray-900">
                NPR {(product.salePrice || product.price)?.toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-gray-500 line-through">NPR {product.price?.toLocaleString()}</span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-xs text-green-600 font-medium">
                You save NPR {(product.price - (product.salePrice || product.price))?.toLocaleString()}
              </span>
            )}
          </div>

          {viewMode === 'list' && (
            <p className="text-sm text-muted mb-4 line-clamp-3">{product.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 flex items-center justify-center space-x-2 hover:bg-gray-100"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            className="flex-1 py-2 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl flex items-center justify-center space-x-2 shadow-lg"
          >
            <Zap className="h-4 w-4" />
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
