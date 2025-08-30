import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  
  // Mock product data
  const mockProduct = {
    id: 1,
    name: 'Manchester United Home Jersey 2024',
    slug: 'manchester-united-home-jersey-2024',
    price: 2500,
    originalPrice: 3000,
    category: 'football-jerseys',
    brand: 'Adidas',
    images: [
      { url: 'https://via.placeholder.com/600x600?text=Man+Utd+Jersey+1' },
      { url: 'https://via.placeholder.com/600x600?text=Man+Utd+Jersey+2' },
      { url: 'https://via.placeholder.com/600x600?text=Man+Utd+Jersey+3' },
      { url: 'https://via.placeholder.com/600x600?text=Man+Utd+Jersey+4' }
    ],
    rating: 4.5,
    reviewCount: 128,
    stock: 15,
    isNew: true,
    description: 'Experience the passion of Old Trafford with the official Manchester United home jersey for the 2024 season. Crafted with premium quality materials and featuring the iconic red design, this jersey represents the rich heritage and winning spirit of one of the most successful clubs in football history.',
    features: [
      'Official Manchester United merchandise',
      'Moisture-wicking Climalite fabric',
      'Comfortable regular fit',
      'Machine washable',
      'Embroidered club crest',
      'Sponsor logos included'
    ],
    sizes: [
      { id: 'XS', name: 'Extra Small', available: true },
      { id: 'S', name: 'Small', available: true },
      { id: 'M', name: 'Medium', available: true },
      { id: 'L', name: 'Large', available: true },
      { id: 'XL', name: 'Extra Large', available: true },
      { id: 'XXL', name: 'Double XL', available: false }
    ],
    specifications: {
      'Material': '100% Polyester',
      'Care Instructions': 'Machine wash cold, tumble dry low',
      'Country of Origin': 'Thailand',
      'Season': '2024/25',
      'Official Licensed': 'Yes'
    },
    reviews: [
      {
        id: 1,
        user: 'Rajesh K.',
        rating: 5,
        date: '2024-01-15',
        comment: 'Excellent quality jersey! Perfect fit and the material feels premium. Highly recommended for any United fan.'
      },
      {
        id: 2,
        user: 'Priya S.',
        rating: 4,
        date: '2024-01-10',
        comment: 'Great jersey, fast delivery. Only issue was the sizing runs slightly small, so order one size up.'
      },
      {
        id: 3,
        user: 'Amit L.',
        rating: 5,
        date: '2024-01-08',
        comment: 'Authentic jersey with perfect printing. My son loves it! Great quality for the price.'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    dispatch(addToCart({ 
      product: { ...product, selectedSize }, 
      quantity 
    }));
    toast.success(`${quantity} x ${product.name} (${selectedSize}) added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
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
      product: { ...product, selectedSize },
      quantity
    };

    const orderTotal = product.price * quantity;

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

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

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
        <span>{product.category.replace('-', ' ')}</span>
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
          {/* Main Image */}
          <div className="relative mb-4">
            <img
              src={product.images[selectedImageIndex].url}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg"
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
            
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img
                  src={image.url}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
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
              <h4 className="font-semibold text-dark mb-3">Key Features:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-xl font-semibold text-dark mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-dark">{key}:</span>
                    <span className="text-muted">{value}</span>
                  </div>
                ))}
              </div>
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
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark">{review.user}</h4>
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
                      <span className="text-sm text-muted">{review.date}</span>
                    </div>
                    <p className="text-muted leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetail;