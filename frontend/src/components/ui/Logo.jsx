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

  // Color variants based on website theme
  const colorVariants = {
    default: {
      primary: '#1ad9ff', // Cyan for jersey body
      secondary: '#5c34fe', // Purple for jersey details
      text: '#1f2937'
    },
    white: {
      primary: '#ffffff',
      secondary: '#f3f4f6',
      text: '#ffffff'
    },
    dark: {
      primary: '#1ad9ff',
      secondary: '#5c34fe',
      text: '#ffffff'
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
      viewBox="0 0 32 32"
      className={`${sizeClasses[size]} ${className}`}
      style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
    >
      <g transform="matrix(1,0,0,1,-288,-240)">
        {/* Jersey body */}
        <motion.path
          d="M307.874,244C307.874,244 310.088,244.025 311.382,244.04C311.961,244.046 312.508,244.304 312.883,244.745C313.796,245.819 315.568,247.904 316.756,249.302C317.43,250.096 317.382,251.274 316.646,252.011C316.277,252.38 315.869,252.788 315.478,253.179C315.048,253.609 314.445,253.82 313.841,253.753C313.237,253.685 312.696,253.346 312.372,252.832C312.155,252.488 312,252.243 312,252.243L312,266C312,266.53 311.789,267.039 311.414,267.414C311.039,267.789 310.53,268 310,268C306.926,268 301.074,268 298,268C297.47,268 296.961,267.789 296.586,267.414C296.211,267.039 296,266.53 296,266C296,261.758 296,252.243 296,252.243C296,252.243 295.845,252.488 295.628,252.832C295.304,253.346 294.763,253.685 294.159,253.753C293.555,253.82 292.952,253.609 292.522,253.179C292.131,252.788 291.723,252.38 291.354,252.011C290.618,251.274 290.57,250.096 291.244,249.302C292.432,247.904 294.204,245.819 295.117,244.745C295.492,244.304 296.039,244.046 296.618,244.04C297.912,244.025 300.126,244 300.126,244C300.571,245.724 302.138,247 304,247C305.862,247 307.429,245.724 307.874,244Z"
          fill={colors.primary}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Jersey details */}
        <motion.path
          d="M295,254.576L295,266C295,267.657 296.343,269 298,269L310,269C310.796,269 311.559,268.684 312.121,268.121C312.684,267.559 313,266.796 313,266L313,254.57C313.233,254.659 313.477,254.718 313.73,254.747C314.636,254.848 315.54,254.531 316.185,253.886C316.576,253.495 316.984,253.087 317.353,252.718C318.458,251.613 318.53,249.845 317.518,248.654C316.33,247.257 314.558,245.171 313.645,244.097C313.083,243.435 312.261,243.05 311.393,243.04C310.099,243.025 307.885,243 307.885,243C307.425,242.995 307.02,243.305 306.905,243.75C306.572,245.044 305.397,246 304,246C302.603,246 301.428,245.044 301.095,243.75C300.98,243.305 300.575,242.995 300.115,243C300.115,243 297.901,243.025 296.607,243.04C295.739,243.05 294.917,243.435 294.355,244.097C293.442,245.171 291.67,247.257 290.482,248.654C289.47,249.845 289.542,251.613 290.647,252.718C291.019,253.09 291.43,253.501 291.824,253.895C292.467,254.538 293.367,254.854 294.271,254.753C294.523,254.724 294.768,254.665 295,254.576ZM311,261C311,261 297,261 297,261C297,261 297,266 297,266C297,266.552 297.448,267 298,267C298,267 310,267 310,267C310.265,267 310.52,266.895 310.707,266.707C310.895,266.52 311,266.265 311,266L311,261ZM297,257L297,259L311,259L311,257L297,257ZM311,255L297,255L297,252.243C297,251.797 296.705,251.406 296.278,251.282C295.85,251.158 295.392,251.333 295.154,251.709L294.838,252.211C294.838,252.211 294.698,252.417 294.665,252.454C294.505,252.627 294.286,252.738 294.049,252.765C293.749,252.798 293.451,252.694 293.238,252.481L292.061,251.304C291.693,250.936 291.669,250.346 292.006,249.949L295.879,245.392C296.066,245.172 296.34,245.043 296.63,245.04C296.63,245.04 299.421,245.008 299.421,245.008C300.195,246.769 301.955,248 304,248C306.045,248 307.805,246.769 308.58,245.008L311.37,245.04C311.66,245.043 311.934,245.172 312.121,245.392L315.994,249.949C316.331,250.346 316.307,250.936 315.939,251.304L314.77,252.472C314.555,252.687 314.254,252.793 313.952,252.759C313.65,252.725 313.38,252.556 313.217,252.299L312.846,251.709C312.608,251.333 312.15,251.158 311.722,251.282C311.295,251.406 311,251.797 311,252.243L311,255Z"
          fill={colors.secondary}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
      </g>
    </svg>
  );

  const LogoComponent = animated ? motion.div : 'div';
  const TextComponent = animated ? motion.span : 'span';

  return (
    <div className="flex items-center space-x-2">
      <LogoComponent
        className="flex-shrink-0 cursor-pointer"
        variants={animated ? logoVariants : {}}
        initial={animated ? "initial" : false}
        whileHover={animated ? "hover" : false}
        whileTap={animated ? "tap" : false}
      >
        <LogoSVG />
      </LogoComponent>
      
      {showText && (
        <TextComponent
          className={`font-bold ${textSizes[size]} ${variant === 'white' || variant === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`}
          style={{ color: colors.text }}
          variants={animated ? textVariants : {}}
          initial={animated ? "initial" : false}
          whileHover={animated ? "hover" : false}
        >
          JerseyNexus
        </TextComponent>
      )}
    </div>
  );
};

export default Logo;
