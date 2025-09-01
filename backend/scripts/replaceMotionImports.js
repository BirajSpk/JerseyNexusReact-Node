#!/usr/bin/env node

/**
 * Script to replace framer-motion imports with our temporary motion wrapper
 */

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend/src');

const files = [
  'components/FeaturedProducts.jsx',
  'components/ProductCard.jsx', 
  'components/layout/Footer.jsx',
  'components/layout/Navbar.jsx',
  'pages/About.jsx',
  'pages/Cart.jsx',
  'pages/Checkout.jsx',
  'pages/Contact.jsx',
  'pages/Home.jsx',
  'pages/NotFound.jsx',
  'pages/OrderDetail.jsx',
  'pages/OrderSuccess.jsx',
  'pages/PaymentSelection.jsx',
  'pages/ProductDetail.jsx',
  'pages/Products.jsx',
  'pages/Profile.jsx',
  'pages/auth/Login.jsx',
  'pages/auth/Register.jsx'
];

files.forEach(fileName => {
  const filePath = path.join(frontendDir, fileName);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace framer-motion imports
      content = content.replace(
        /import { motion(.*?) } from ['"]framer-motion['"];/g,
        "import { motion$1 } from '../utils/motion'; // Temporary motion wrapper"
      );
      
      // Handle different import depths for utils/motion
      if (fileName.includes('pages/')) {
        content = content.replace(
          "import { motion",
          "import { motion"
        ).replace(
          "} from '../utils/motion';",
          "} from '../utils/motion';"
        );
      } else if (fileName.includes('components/layout/')) {
        content = content.replace(
          '../utils/motion',
          '../../utils/motion'
        );
      } else if (fileName.includes('components/')) {
        content = content.replace(
          '../utils/motion',
          '../utils/motion'
        );
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error updating ${fileName}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${fileName}`);
  }
});

console.log('🎉 Motion import replacement completed!');