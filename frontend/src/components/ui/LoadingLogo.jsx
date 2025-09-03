import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingLogo = ({ size = 'xl', message = 'Loading...' }) => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className="mb-6"
      >
        <Logo size={size} animated={true} showText={true} variant="default" />
      </motion.div>
      
      <motion.div
        variants={textVariants}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <p className="text-lg text-gray-600 mb-2">{message}</p>
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingLogo;
