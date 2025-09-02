import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  Filter,
  Grid,
  List,
  ChevronDown,
  X,
  Star
} from '../components/ui/ProfessionalIcon';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI } from '../utils/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false); // Hidden by default on mobile

  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  const brands = [
    { id: 'nike', name: 'Nike', count: 312 },
    { id: 'adidas', name: 'Adidas', count: 287 },
    { id: 'puma', name: 'Puma', count: 156 },
    { id: 'under-armour', name: 'Under Armour', count: 89 }
  ];

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products and categories in parallel
        let productsResponse;

        if (searchQuery.trim()) {
          // Use search API if there's a search query
          productsResponse = await productAPI.searchProducts(searchQuery, {
            page: 1,
            limit: 50,
            categoryId: selectedCategory,
            sortBy,
            sortOrder: 'desc'
          });
        } else {
          // Use regular products API
          productsResponse = await productAPI.getProducts({
            page: 1,
            limit: 50,
            category: selectedCategory
          });
        }

        const categoriesResponse = await categoryAPI.getProductCategories();

        if (productsResponse.data.success) {
          setProducts(productsResponse.data.data.products || []);
        }

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data.categories || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products. Please try again.');
        // Fallback to empty arrays
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery, sortBy]);

  // Update search query when URL params change
  useEffect(() => {
    const urlSearchQuery = searchParams.get('q') || '';
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter (already handled by API, but keep for client-side refinement)
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.categoryId === selectedCategory ||
        (product.category && product.category.id === selectedCategory)
      );
    }

    // Brand filter (if brand data is available)
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && selectedBrands.includes(product.brand.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          // Handle case where rating might not exist
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, selectedCategory, selectedBrands, priceRange, sortBy]);



  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft p-4 animate-pulse">
              <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-dark mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Products'}
        </h1>
        <p className="text-muted max-w-2xl">
          {searchQuery
            ? `Found ${products.length} products matching your search.`
            : 'Discover our extensive collection of authentic sportswear and jerseys from top teams around the world.'
          }
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex items-center space-x-4 ml-auto">
          {/* Filter Toggle - Only visible on mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline px-4 py-3 flex items-center space-x-2 lg:hidden"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
          
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:w-64 bg-white rounded-lg shadow-soft p-6 ${showFilters ? 'block' : 'hidden'} lg:block`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-dark">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-medium text-dark mb-3">Categories</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => handleCategoryChange('')}
                  className="mr-2"
                />
                <span className="text-sm">All Categories</span>
              </label>
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Brands */}
          <div className="mb-6">
            <h4 className="font-medium text-dark mb-3">Brands</h4>
            <div className="space-y-2">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{brand.name} ({brand.count})</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Price Range */}
          <div>
            <h4 className="font-medium text-dark mb-3">Price Range</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted">
                <span>NPR {priceRange[0]}</span>
                <span>NPR {priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Shopping Tips Section */}
          <div className="mt-8 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Star className="w-5 h-5 text-primary mr-2" />
              Shopping Tips
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Check size charts before ordering
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Free shipping on orders over Rs. 5000
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                30-day return policy available
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Authentic jerseys guaranteed
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Popular Categories</h4>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className="block w-full text-left text-sm text-gray-600 hover:text-primary transition-colors py-1"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Can't find what you're looking for?
            </p>
            <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {(selectedCategory || selectedBrands.length > 0) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted">Active filters:</span>
                {selectedCategory && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <span>{categories.find(c => c.id === selectedCategory)?.name || 'Selected Category'}</span>
                    <button onClick={() => handleCategoryChange('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <span>{brands.find(b => b.id === brand)?.name}</span>
                    <button onClick={() => handleBrandToggle(brand)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

              </div>
            )}
          </div>
          
          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">No products found matching your criteria.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;