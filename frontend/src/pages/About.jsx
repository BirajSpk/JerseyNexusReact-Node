import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About JerseyNexus
            </h1>
            <p className="text-xl text-white/90">
              Nepal's premier destination for authentic sportswear and jerseys. 
              Bringing quality sports fashion to every corner of Nepal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
                Our Story
              </h2>
              <p className="text-muted mb-4">
                Founded with a passion for sports and quality, JerseyNexus began as a vision 
                to bring authentic sportswear to Nepal. We understand the love Nepali sports 
                fans have for their favorite teams and players.
              </p>
              <p className="text-muted mb-4">
                Our mission is simple: provide 100% authentic jerseys and sportswear with 
                fast, reliable delivery across Nepal. From football to basketball, cricket 
                to training wear, we've got you covered.
              </p>
              <p className="text-muted">
                Every product in our collection is carefully selected to ensure authenticity 
                and quality. We work directly with official suppliers to guarantee that every 
                jersey you purchase is the real deal.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-neutral rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                    <div className="text-muted">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-muted">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <div className="text-muted">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">100%</div>
                    <div className="text-muted">Authentic</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-neutral">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              These core values guide everything we do at JerseyNexus
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Authenticity',
                description: 'Every product we sell is 100% authentic and officially licensed.'
              },
              {
                title: 'Quality',
                description: 'We never compromise on quality - from products to customer service.'
              },
              {
                title: 'Community',
                description: 'We\'re part of the Nepali sports community and proud to serve it.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-soft text-center"
              >
                <h3 className="text-xl font-semibold text-dark mb-4">
                  {value.title}
                </h3>
                <p className="text-muted">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;