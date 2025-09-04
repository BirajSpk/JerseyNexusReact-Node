import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/blogs/slug/${slug}`);
      setBlog(response.data.data.blog);

      // Fetch related blogs
      if (response.data.data.blog?.categoryId) {
        fetchRelatedBlogs(response.data.data.blog.categoryId, response.data.data.blog.id);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (categoryId, currentBlogId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/blogs?categoryId=${categoryId}&limit=3`);
      const blogs = response.data.data?.blogs || response.data.data || [];
      setRelatedBlogs(blogs.filter(b => b.id !== currentBlogId));
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blogs" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <Link to="/blogs" className="inline-flex items-center text-primary hover:text-primary-dark mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Link>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>{blog.author?.name || 'Admin'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              {blog.category && (
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {blog.category.name}
                  </span>
                </div>
              )}
            </div>

            {blog.featuredImage && (
              <div className="mb-8">
                <img
                  src={getImageUrl(blog.featuredImage)}
                  alt={blog.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog.id}
                    to={`/blogs/${relatedBlog.slug}`}
                    className="group"
                  >
                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {relatedBlog.featuredImage && (
                        <img
                          src={getImageUrl(relatedBlog.featuredImage)}
                          alt={relatedBlog.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {relatedBlog.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(relatedBlog.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;