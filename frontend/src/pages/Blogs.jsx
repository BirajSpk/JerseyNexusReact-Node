import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../utils/motion';
import { Calendar, User, Search, Filter, ArrowRight } from '../components/ui/ProfessionalIcon';
import { blogAPI } from '../utils/api';
import { getImageUrl } from '../utils/helpers';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getPublishedBlogs();
      setBlogs(response.data.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Fallback to mock data if API fails
      setBlogs([
        {
          id: '1',
          title: 'The Evolution of Football Jerseys: From Classic to Modern',
          excerpt: 'Explore how football jerseys have transformed over the decades, from simple cotton shirts to high-tech performance wear that enhances player performance.',
          slug: 'evolution-football-jerseys',
          createdAt: '2024-01-15T10:00:00Z',
          author: { name: 'Sports Editor' },
          category: { name: 'Sports History' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxZTQwYWYiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rm9vdGJhbGwgRXZvbHV0aW9uPC90ZXh0Pjwvc3ZnPg=='
        },
        {
          id: '2',
          title: 'Top 10 Most Iconic Football Jerseys of All Time',
          excerpt: 'Discover the most legendary football jerseys that have left an indelible mark on the sport and fashion world, from Brazil\'s yellow to Barcelona\'s stripes.',
          slug: 'top-10-iconic-football-jerseys',
          createdAt: '2024-01-12T14:30:00Z',
          author: { name: 'Fashion Expert' },
          category: { name: 'Fashion' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNkYzI2MjYiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SWNvbmljIEplcnNleXM8L3RleHQ+PC9zdmc+'
        },
        {
          id: '3',
          title: 'How to Choose the Perfect Jersey Size and Fit',
          excerpt: 'A comprehensive guide to finding the right jersey size for comfort, style, and authentic team representation. Learn about different fits and sizing charts.',
          slug: 'choose-perfect-jersey-size',
          createdAt: '2024-01-10T09:15:00Z',
          author: { name: 'Style Guide' },
          category: { name: 'Buying Guide' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwNTk2NjkiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2l6ZSBHdWlkZTwvdGV4dD48L3N2Zz4='
        },
        {
          id: '4',
          title: 'Premier League 2024/25 Season: New Jersey Releases',
          excerpt: 'Get an exclusive look at all the new Premier League jersey releases for the 2024/25 season, featuring innovative designs and sustainable materials.',
          slug: 'premier-league-2024-25-jerseys',
          createdAt: '2024-01-08T16:45:00Z',
          author: { name: 'Premier League Insider' },
          category: { name: 'News' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiM3YzNhZWQiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJlbWllciBMZWFndWU8L3RleHQ+PC9zdmc+'
        },
        {
          id: '5',
          title: 'Caring for Your Football Jersey: Maintenance Tips',
          excerpt: 'Learn the best practices for washing, storing, and maintaining your football jerseys to keep them looking fresh and lasting longer.',
          slug: 'caring-for-football-jersey',
          createdAt: '2024-01-05T11:20:00Z',
          author: { name: 'Care Expert' },
          category: { name: 'Care Guide' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNlYTU4MGMiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FyZSBUaXBzPC90ZXh0Pjwvc3ZnPg=='
        },
        {
          id: '6',
          title: 'The Psychology of Team Colors in Football',
          excerpt: 'Explore how team colors influence player performance and fan psychology, and why certain color combinations become iconic in football history.',
          slug: 'psychology-team-colors-football',
          createdAt: '2024-01-03T13:10:00Z',
          author: { name: 'Sports Psychologist' },
          category: { name: 'Psychology' },
          featuredImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNiZTE4NWQiLz48dGV4dCB4PSIzMDAiIHk9IjIwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHN5Y2hvbG9neTwvdGV4dD48L3N2Zz4='
        }
      ]);

      setCategories([
        { name: 'All', value: '' },
        { name: 'Sports History', value: 'sports-history' },
        { name: 'Fashion', value: 'fashion' },
        { name: 'Buying Guide', value: 'buying-guide' },
        { name: 'News', value: 'news' },
        { name: 'Care Guide', value: 'care-guide' },
        { name: 'Psychology', value: 'psychology' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // This would fetch blog categories from API
      // For now using mock data
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory ||
                           blog.category?.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sports <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Stay updated with the latest sports news, jersey reviews, style guides, and insights from the world of football.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search terms or category filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog, index) => (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(blog.featuredImage) || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#f3f4f6"/><text x="300" y="205" fill="#9ca3af" text-anchor="middle">Blog Image</text></svg>')}
                        alt={blog.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Prevent infinite loop by checking if we're already showing the fallback
                          if (!e.target.src.includes('data:image')) {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIyNSIgeT0iMTc1IiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CbG9nIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                          }
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {blog.category?.name || 'Sports'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link to={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>{blog.author?.name || 'JerseyNexus Team'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>

                      <Link
                        to={`/blogs/${blog.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination would go here */}
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  Showing {filteredBlogs.length} of {blogs.length} articles
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blogs;