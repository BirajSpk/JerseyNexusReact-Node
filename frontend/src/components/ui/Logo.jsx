import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ 
  size = 'md', 
  className = '', 
  animated = true,
  showText = true,
  variant = 'default' // 'default', 'white', 'dark'
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  // Color variants based on website theme - Professional colors
  const colorVariants = {
    default: {
      primary: '#1A73E8', // Blue circle background for better contrast
      secondary: '#ffffff', // White building/jersey shape
      text: '#1f2937',
      accent: '#FFD05B', // Yellow rectangle
      green: '#4CDBC4', // Green rectangle
      red: '#FF7058', // Red rectangle
      dark: '#324A5E' // Dark rectangle
    },
    white: {
      primary: '#ffffff', // White circle for dark backgrounds
      secondary: '#1A73E8', // Blue building/jersey shape for contrast
      text: '#ffffff',
      accent: '#FFD05B',
      green: '#4CDBC4',
      red: '#FF7058',
      dark: '#324A5E'
    },
    dark: {
      primary: '#1A73E8', // Blue circle for dark backgrounds
      secondary: '#ffffff', // White building/jersey shape
      text: '#ffffff',
      accent: '#FFD05B', // Yellow rectangle
      green: '#4CDBC4', // Green rectangle
      red: '#FF7058', // Red rectangle
      dark: '#324A5E' // Dark rectangle
    },
    hero: {
      primary: '#35D299', // Green circle for hero section
      secondary: '#ffffff', // White building/jersey shape
      text: '#ffffff',
      accent: '#FFD05B', // Yellow rectangle
      green: '#4CDBC4', // Green rectangle
      red: '#FF7058', // Red rectangle
      dark: '#324A5E' // Dark rectangle
    }
  };

  const colors = colorVariants[variant];

  const logoVariants = {
    initial: { 
      scale: 1,
      rotate: 0
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        rotate: {
          duration: 0.8,
          ease: "easeInOut"
        }
      }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const textVariants = {
    initial: { opacity: 0.8 },
    hover: { 
      opacity: 1,
      x: [0, 2, 0],
      transition: { duration: 0.3 }
    }
  };

  const LogoSVG = () => (
    <svg
      viewBox="0 0 505 505"
      className={`${sizeClasses[size]} ${className}`}
      style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
    >
      {/* New JerseyNexus Logo */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
      </defs>

      {/* Main Circle Background */}
      <motion.circle
        cx="252.5"
        cy="252.5"
        r="252.5"
        fill={colors.primary}
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 1, ease: "easeInOut" } : {}}
      />

      {/* White Building/Jersey Shape */}
      <motion.path
        d="M350.4,100.7H234.5l0,0l-33.4,33.4c17.9,17.9,17.9,46.9,0,64.7c-17.9,17.9-46.9,17.9-64.7,0 L103,232.2l2.2,2.2l-2.3-2.1v115.9h61.9V294l105.8,105.8l131.6-131.6L296.4,162.6h54V100.7z"
        fill={colors.secondary}
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : false}
        transition={animated ? { duration: 1.2, delay: 0.3, ease: "easeInOut" } : {}}
      />

      {/* White Center Element */}
      <motion.path
        d="M281.2,245v12.4c-9.3,1.7-18.9,2.6-28.7,2.6c-9.8,0-19.4-0.9-28.7-2.6V245c9.3,1.6,18.9,2.4,28.7,2.4 C262.3,247.4,271.9,246.6,281.2,245z"
        fill={colors.secondary}
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 0.8, delay: 0.6, ease: "easeInOut" } : {}}
      />

      {/* Yellow Rectangle */}
      <motion.rect
        x="218.81"
        y="270.084"
        width="25.2"
        height="25.2"
        fill={colors.accent}
        transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 594.9292 318.9407)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 0.6, delay: 0.8, ease: "easeInOut" } : {}}
      />

      {/* Green Rectangle */}
      <motion.rect
        x="254.413"
        y="270.102"
        width="25.2"
        height="25.2"
        fill={colors.green}
        transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 655.7191 293.7952)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 0.6, delay: 0.9, ease: "easeInOut" } : {}}
      />

      {/* Red Rectangle */}
      <motion.rect
        x="254.44"
        y="234.489"
        width="25.2"
        height="25.2"
        fill={colors.red}
        transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 630.5836 232.9812)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 0.6, delay: 1.0, ease: "easeInOut" } : {}}
      />

      {/* Dark Rectangle */}
      <motion.rect
        x="290.043"
        y="234.506"
        width="25.2"
        height="25.2"
        fill={colors.dark}
        transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 691.3735 207.8356)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={animated ? { duration: 0.6, delay: 1.1, ease: "easeInOut" } : {}}
      />
    </svg>
  );

  const LogoComponent = animated ? motion.div : 'div';
  const TextComponent = animated ? motion.span : 'span';

  // Prepare props conditionally
  const logoProps = animated ? {
    className: "flex-shrink-0 cursor-pointer",
    variants: logoVariants,
    initial: "initial",
    whileHover: "hover",
    whileTap: "tap"
  } : {
    className: "flex-shrink-0 cursor-pointer"
  };

  const textProps = animated ? {
    className: `font-bold ${textSizes[size]} ${variant === 'white' || variant === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`,
    style: { color: colors.text },
    variants: textVariants,
    initial: "initial",
    whileHover: "hover"
  } : {
    className: `font-bold ${textSizes[size]} ${variant === 'white' || variant === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`,
    style: { color: colors.text }
  };

  return (
    <div className="flex items-center space-x-2">
      <LogoComponent {...logoProps}>
        <LogoSVG />
      </LogoComponent>

      {showText && (
        <TextComponent {...textProps}>
          JerseyNexus
        </TextComponent>
      )}
    </div>
  );
};

export default Logo;
