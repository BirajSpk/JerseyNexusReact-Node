import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { ShoppingBag, Truck, Shield, Star } from '../components/ui/ProfessionalIcon';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedBlogs from '../components/FeaturedBlogs';

const Home = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: '100% Authentic',
      description: 'All our jerseys are officially licensed and authentic products.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick delivery across Nepal with reliable shipping partners.'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Your payments are protected with bank-level security.'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'Premium quality materials and excellent customer service.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Your Premier
                <span className="text-accent block">Sports Destination</span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Discover authentic jerseys from top teams around the world. 
                Quality sportswear delivered fast across Nepal.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="btn bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                >
                  Shop Now
                </Link>
                <Link
                  to="/about"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-32 h-32 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">JerseyNexus</h3>
                  <p className="text-white/80">Premium Sports Collection</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Why Choose JerseyNexus?
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              We're committed to providing the best sportswear shopping experience in Nepal
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:shadow-soft transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Featured Blogs Section */}
      <FeaturedBlogs />

      {/* CTA Section */}
      <section className="py-16 bg-neutral">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Browse our extensive collection of authentic jerseys and sportswear. 
              Fast delivery across Nepal guaranteed!
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="btn btn-primary px-8 py-3 text-lg font-semibold"
              >
                Explore Products
              </Link>
              <Link
                to="/contact"
                className="btn btn-outline px-8 py-3 text-lg font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;