import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { ShoppingBag, Truck, Shield, Star } from '../components/ui/ProfessionalIcon';
import FeaturedProducts from '../components/FeaturedProducts';
import FeaturedBlogs from '../components/FeaturedBlogs';
import HeroProductShowcase from '../components/HeroProductShowcase';
import Logo from '../components/ui/Logo';

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
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-12 min-h-[80vh] flex items-center">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <p className="text-accent font-semibold text-lg">Nepal's #1 Sports Store</p>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  Your Premier
                  <span className="text-accent block">Sports Destination</span>
                </h1>
              </div>

              <p className="text-lg text-white/90 leading-relaxed">
                Discover authentic jerseys from top teams around the world.
                Quality sportswear delivered fast across Nepal with 100% authenticity guarantee.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">100% Authentic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 py-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">500+</div>
                  <div className="text-sm text-white/80">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">10K+</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">50+</div>
                  <div className="text-sm text-white/80">Teams</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  to="/products"
                  className="btn bg-white text-primary hover:bg-white/90 px-6 py-3 text-base font-semibold flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </Link>
                <Link
                  to="/about"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-6 py-3 text-base font-semibold"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-sm">
                <HeroProductShowcase />
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