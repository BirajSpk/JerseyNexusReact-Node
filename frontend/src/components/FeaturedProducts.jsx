import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock featured products - In real app, this would come from API
  const mockFeaturedProducts = [
    {
      id: 1,
      name: 'Manchester United Home Jersey 2024',
      slug: 'manchester-united-home-jersey-2024',
      price: 2500,
      originalPrice: 3000,
      category: 'football-jerseys',
      brand: 'Adidas',
      images: [{ url: 'https://via.placeholder.com/400x400?text=Man+Utd+Jersey' }],
      rating: 4.5,
      reviewCount: 128,
      stock: 15,
      isNew: true,
      description: 'Official Manchester United home jersey for 2024 season'
    },
    {
      id: 2,
      name: 'Real Madrid Away Jersey 2024',
      slug: 'real-madrid-away-jersey-2024',
      price: 2700,
      originalPrice: 3200,
      category: 'football-jerseys',
      brand: 'Adidas',
      images: [{ url: 'https://via.placeholder.com/400x400?text=Real+Madrid+Jersey' }],
      rating: 4.8,
      reviewCount: 95,
      stock: 8,
      isNew: false,
      description: 'Official Real Madrid away jersey for 2024 season'
    },
    {
      id: 3,
      name: 'Lakers LeBron James Jersey',
      slug: 'lakers-lebron-james-jersey',
      price: 3200,
      originalPrice: 3800,
      category: 'basketball-jerseys',
      brand: 'Nike',
      images: [{ url: 'https://via.placeholder.com/400x400?text=Lakers+Jersey' }],
      rating: 4.7,
      reviewCount: 76,
      stock: 12,
      isNew: true,
      description: 'Official Lakers LeBron James basketball jersey'
    },
    {
      id: 4,
      name: 'India Cricket Team Jersey 2024',
      slug: 'india-cricket-team-jersey-2024',
      price: 1800,
      originalPrice: 2200,
      category: 'cricket-jerseys',
      brand: 'Nike',
      images: [{ url: 'https://via.placeholder.com/400x400?text=India+Cricket+Jersey' }],
      rating: 4.6,
      reviewCount: 143,
      stock: 25,
      isNew: false,
      description: 'Official India cricket team jersey for 2024'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setFeaturedProducts(mockFeaturedProducts);
      setLoading(false);
    }, 800);
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