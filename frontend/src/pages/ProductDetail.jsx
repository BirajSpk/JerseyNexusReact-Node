import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle,
  ArrowLeft,
  Zap
} from '../components/ui/ProfessionalIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { productAPI } from '../utils/api';
import BackButton from '../components/ui/BackButton';
import RelatedProducts from '../components/RelatedProducts';
import ImageZoom from '../components/ImageZoom';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  // No image index needed for single image
  const [activeTab, setActiveTab] = useState('description');
  


  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const response = await productAPI.getProductBySlug(slug);

        if (response.data.success) {
          const productData = response.data.data.product;

          // Check if product data is empty or null
          if (!productData || Object.keys(productData).length === 0) {
            throw new Error('Product not found');
          }

          // Process images - handle both string arrays and object arrays
          console.log('Raw product images:', productData.images);
          let processedImages = [];

          if (productData.images) {
            // Backend contains single image URL as string
            const imageUrl = productData.images;
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${imageUrl}`;

            processedImages = [{
              url: fullImageUrl,
              altText: productData.name || 'Product Image'
            }];
          }

          // If no images, add placeholder
          if (processedImages.length === 0) {
            processedImages = [{
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIzMDAiIHk9IjMxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==',
              altText: productData.name || 'Product Image'
            }];
          }

          console.log('Processed images:', processedImages);

          // Process sizes - handle both string arrays and object arrays
          let processedSizes = [];
          if (productData.sizes) {
            if (Array.isArray(productData.sizes)) {
              processedSizes = productData.sizes.map(size => {
                if (typeof size === 'string') {
                  return { id: size, name: size, available: true };
                } else {
                  return { id: size.id || size.name, name: size.name || size.id, available: size.available !== false };
                }
              });
            }
          }

          // Default sizes if none provided
          if (processedSizes.length === 0) {
            processedSizes = [
              { id: 'S', name: 'Small', available: true },
              { id: 'M', name: 'Medium', available: true },
              { id: 'L', name: 'Large', available: true },
              { id: 'XL', name: 'Extra Large', available: true }
            ];
          }

          // Set processed product data with defaults
          setProduct({
            ...productData,
            images: processedImages,
            sizes: processedSizes,
            colors: productData.colors || ['Default'],
            rating: productData.rating || 4.5,
            reviewCount: productData.reviews?.length || 0,
            isNew: productData.featured || false,
            features: productData.features || [],
            specifications: productData.specifications || {},
            reviews: productData.reviews || []
          });
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    // Check if product has sizes and none is selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    dispatch(addToCart({
      product: {
        ...product,
        selectedSize: selectedSize || null
      },
      quantity,
      size: selectedSize || null
    }));

    const sizeText = selectedSize ? ` (${selectedSize})` : '';
    toast.success(`${quantity} x ${product.name}${sizeText} added to cart!`);
  };

  const handleBuyNow = () => {
    // Check if product has sizes and none is selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: `/product/${slug}` },
          message: 'Please login to proceed with your purchase'
        }
      });
      return;
    }

    // Create order item for checkout
    const orderItem = {
      product: {
        ...product,
        selectedSize: selectedSize || null
      },
      quantity,
      size: selectedSize || null
    };

    const orderTotal = (product.salePrice || product.price) * quantity;

    // Navigate to checkout with order data
    navigate('/checkout', {
      state: {
        items: [orderItem],
        total: orderTotal
      }
    });
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // No image navigation needed for single image

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            <div className="h-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-dark mb-4">Product Not Found</h1>
        <p className="text-muted mb-8">The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 text-sm text-muted mb-8"
      >
        <button onClick={() => navigate('/products')} className="hover:text-primary transition-colors flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </button>
        <span>/</span>
        <span>{product.category?.name || 'Category'}</span>
        <span>/</span>
        <span className="text-dark">{product.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Image with Zoom */}
          <div className="relative mb-4">
            <ImageZoom
              src={product.images?.[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIzMDAiIHk9IjMxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
              alt={product.images?.[0]?.altText || product.name}
              className="w-full aspect-square rounded-lg"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                New
              </span>
            )}
            {product.originalPrice > product.price && (
              <span className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-full text-sm font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
            
            {/* No navigation arrows needed for single image */}
          </div>
          
          {/* No thumbnail gallery needed for single image */}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-dark mb-4">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-muted">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-dark">NPR {product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xl text-muted line-through">NPR {product.originalPrice}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted mb-6 leading-relaxed">{product.description}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-dark mb-3">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => size.available && setSelectedSize(size.id)}
                  disabled={!size.available}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedSize === size.id
                      ? 'border-primary bg-primary text-white'
                      : size.available
                      ? 'border-gray-300 hover:border-primary'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {size.id}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold text-dark mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold px-4">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted ml-4">
                {product.stock} items available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full btn bg-accent hover:bg-accent/90 text-white py-4 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Buy Now'}</span>
            </button>
            
            {/* Add to Cart and Other Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn btn-primary py-3 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button className="btn btn-outline p-3">
                <Heart className="h-5 w-5" />
              </button>
              <button className="btn btn-outline p-3">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <Truck className="h-5 w-5 text-primary" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span>Easy Returns</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-4 text-sm text-muted">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Official Licensed</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Details Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-16"
      >
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-dark'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-xl font-semibold text-dark mb-4">Product Description</h3>
              <p className="text-muted leading-relaxed mb-6">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <>
                  <h4 className="font-semibold text-dark mb-3">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-xl font-semibold text-dark mb-4">Specifications</h3>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-dark">{key}:</span>
                      <span className="text-muted">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-dark">Customer Reviews</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted">({product.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {(review.user?.name || review.user || 'U').charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-dark">{review.user?.name || review.user || 'Anonymous'}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted">{review.date || review.createdAt}</span>
                      </div>
                      <p className="text-muted leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Related Products Section */}
      {product && <RelatedProducts currentProduct={product} />}
    </div>
  );
};

export default ProductDetail;