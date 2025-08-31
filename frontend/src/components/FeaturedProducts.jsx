import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { ArrowRight, ShoppingBag, Loader } from './ui/ProfessionalIcon';
import ProductCard from './ProductCard';
import { productAPI } from '../utils/api';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productAPI.getFeaturedProducts();

        if (response.data.success) {
          const products = response.data.data.products || [];

          // Process products to ensure proper image handling
          const processedProducts = products.map(product => ({
            ...product,
            images: product.images ? (
              typeof product.images === 'string'
                ? [{ url: product.images }]
                : Array.isArray(product.images)
                  ? product.images
                  : [{ url: product.images.url || product.images }]
            ) : [{ url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pjwvc3ZnPg==' }],
            price: product.salePrice || product.price,
            originalPrice: product.price,
            rating: product.rating || 4.5,
            reviewCount: product.reviewCount || 0,
            stock: product.stock || 0,
            featured: true
          }));

          setFeaturedProducts(processedProducts.slice(0, 8)); // Limit to 8 products
        } else {
          throw new Error('Failed to fetch featured products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('Failed to load featured products');

        // Show error message instead of fallback data
        toast.error('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);



  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Discover our most popular and trending jerseys
            </p>
          </div>
          
          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-soft p-4 animate-pulse">
                <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && featuredProducts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-red-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Discover our most popular and trending jerseys from top teams around the world
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              viewMode="grid"
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 btn btn-primary px-8 py-3 text-lg font-semibold group"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>View All Products</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;