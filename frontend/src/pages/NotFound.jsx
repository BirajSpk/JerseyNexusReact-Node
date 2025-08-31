import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { Home, ArrowLeft } from '../components/ui/ProfessionalIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl md:text-9xl font-bold text-primary mb-4"
            >
              404
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-muted mb-8">
              Sorry, the page you're looking for doesn't exist. It might have been 
              moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/"
              className="btn btn-primary px-6 py-3 text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline px-6 py-3 text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          <div className="mt-12">
            <p className="text-muted mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/products" className="text-primary hover:underline">Products</Link>
              <span className="text-muted">•</span>
              <Link to="/blogs" className="text-primary hover:underline">Blogs</Link>
              <span className="text-muted">•</span>
              <Link to="/about" className="text-primary hover:underline">About</Link>
              <span className="text-muted">•</span>
              <Link to="/contact" className="text-primary hover:underline">Contact</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;