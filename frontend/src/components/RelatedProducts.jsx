import React, { useState, useEffect } from 'react';
import { motion } from '../utils/motion.jsx';
import { ArrowRight, Loader } from './ui/ProfessionalIcon';
import ProductCard from './ProductCard';
import { productAPI } from '../utils/api';
import toast from 'react-hot-toast';

const RelatedProducts = ({ currentProduct }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProduct) return;

      try {
        setLoading(true);
        setError(null);

        // Try to fetch related products based on category first
        let relatedData = [];
        
        if (currentProduct.categoryId) {
          try {
            const categoryResponse = await productAPI.getProductsByCategory(currentProduct.categoryId);
            if (categoryResponse.data.success) {
              relatedData = categoryResponse.data.data.products || [];
              // Filter out the current product
              relatedData = relatedData.filter(product => product.id !== currentProduct.id);
            }
          } catch (categoryError) {
            console.log('Category-based fetch failed, trying general approach');
          }
        }

        // If we don't have enough products from category, fetch more general products
        if (relatedData.length < 6) {
          try {
            const generalResponse = await productAPI.getProducts({
              limit: 12,
              featured: true
            });
            
            if (generalResponse.data.success) {
              const generalProducts = generalResponse.data.data.products || [];
              // Filter out current product and already included products
              const additionalProducts = generalProducts.filter(product => 
                product.id !== currentProduct.id && 
                !relatedData.some(existing => existing.id === product.id)
              );
              
              relatedData = [...relatedData, ...additionalProducts];
            }
          } catch (generalError) {
            console.log('General fetch failed');
          }
        }

        // Process products to ensure proper image handling
        const processedProducts = relatedData.map(product => ({
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
          stock: product.stock || 0
        }));

        // Limit to 6 products and randomize for variety
        const shuffled = processedProducts.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 6));

      } catch (error) {
        console.error('Error fetching related products:', error);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProduct]);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-8">
            You May Also Like
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-soft overflow-hidden">
                <div className="bg-gray-200 h-64 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded animate-pulse"></div>
                  <div className="bg-gray-200 h-4 w-3/4 rounded animate-pulse"></div>
                  <div className="bg-gray-200 h-6 w-1/2 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted">Loading related products...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || relatedProducts.length === 0) {
    return null; // Don't show the section if there are no related products
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            You May Also Like
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Discover more amazing products similar to what you're viewing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard 
                product={product} 
                index={index}
                viewMode="grid"
              />
            </motion.div>
          ))}
        </div>

        {/* View All Products Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <a
            href="/products"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default RelatedProducts;
