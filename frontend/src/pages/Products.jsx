import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronDown, 
  Star, 
  ShoppingCart,
  Heart,
  Eye,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  // Mock data - In real app, this would come from API
  const mockProducts = [
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
    },
    {
      id: 5,
      name: 'Barcelona Training Kit 2024',
      slug: 'barcelona-training-kit-2024',
      price: 2200,
      originalPrice: 2600,
      category: 'training-wear',
      brand: 'Nike',
      images: [{ url: 'https://via.placeholder.com/400x400?text=Barca+Training' }],
      rating: 4.4,
      reviewCount: 62,
      stock: 18,
      isNew: true,
      description: 'Official Barcelona training kit for 2024 season'
    },
    {
      id: 6,
      name: 'Golden State Warriors Curry Jersey',
      slug: 'golden-state-warriors-curry-jersey',
      price: 3500,
      originalPrice: 4000,
      category: 'basketball-jerseys',
      brand: 'Nike',
      images: [{ url: 'https://via.placeholder.com/400x400?text=Warriors+Jersey' }],
      rating: 4.9,
      reviewCount: 189,
      stock: 6,
      isNew: false,
      description: 'Official Golden State Warriors Stephen Curry jersey'
    }
  ];
  
  const categories = [
    { id: 'football-jerseys', name: 'Football Jerseys', count: 245 },
    { id: 'basketball-jerseys', name: 'Basketball Jerseys', count: 128 },
    { id: 'cricket-jerseys', name: 'Cricket Jerseys', count: 89 },
    { id: 'training-wear', name: 'Training Wear', count: 156 }
  ];
  
  const brands = [
    { id: 'nike', name: 'Nike', count: 312 },
    { id: 'adidas', name: 'Adidas', count: 287 },
    { id: 'puma', name: 'Puma', count: 156 },
    { id: 'under-armour', name: 'Under Armour', count: 89 }
  ];

  // Simulate API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.brand.toLowerCase())
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
          return b.rating - a.rating;
        case 'newest':
          return b.isNew - a.isNew;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return filtered;
  }, [products, searchQuery, selectedCategory, selectedBrands, priceRange, sortBy]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

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
    setSearchQuery('');
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
        <h1 className="text-3xl font-bold text-dark mb-4">Products</h1>
        <p className="text-muted max-w-2xl">
          Discover our extensive collection of authentic sportswear and jerseys from top teams around the world.
        </p>
      </motion.div>

      {/* Search & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, or teams..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </form>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline px-4 py-3 flex items-center space-x-2"
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
          animate={{ opacity: showFilters ? 1 : 0, x: showFilters ? 0 : -20 }}
          className={`lg:w-64 bg-white rounded-lg shadow-soft p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}
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
                  <span className="text-sm">{category.name} ({category.count})</span>
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
        </motion.div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {(selectedCategory || selectedBrands.length > 0 || searchQuery) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted">Active filters:</span>
                {selectedCategory && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
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
                {searchQuery && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <span>"{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
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
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-lg shadow-soft overflow-hidden group hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
                        New
                      </span>
                    )}
                    {product.originalPrice > product.price && (
                      <span className="absolute top-2 right-2 bg-danger text-white px-2 py-1 rounded text-xs font-medium">
                        Sale
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/products/${product.slug}`)}
                        className="bg-white text-dark p-2 rounded-full hover:bg-neutral transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="bg-white text-dark p-2 rounded-full hover:bg-neutral transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-dark line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => navigate(`/products/${product.slug}`)}
                      >
                        {product.name}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted mb-2">{product.brand}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted ml-2">({product.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-dark">NPR {product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-muted line-through">NPR {product.originalPrice}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.stock > 10 
                          ? 'bg-accent/10 text-accent' 
                          : product.stock > 0
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full btn btn-primary py-2 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;