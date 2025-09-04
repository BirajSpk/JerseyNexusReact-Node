const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingImages() {
  try {
    console.log('🖼️ Adding images to products without images...');

    // Get all products without images
    const products = await prisma.product.findMany({
      include: {
        productImages: true
      },
      where: {
        productImages: {
          none: {}
        }
      }
    });

    const imageUrls = [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'
    ];

    for (const product of products) {
      console.log(`Adding images to: ${product.name}`);
      
      // Add front image
      const frontImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: frontImageUrl,
          altText: `${product.name} - Front`,
          isPrimary: true,
          sortOrder: 0
        }
      });

      // Add back image
      let backImageUrl;
      do {
        backImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      } while (backImageUrl === frontImageUrl); // Ensure different image

      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: backImageUrl,
          altText: `${product.name} - Back`,
          isPrimary: false,
          sortOrder: 1
        }
      });

      console.log(`✅ Added front and back images to: ${product.name}`);
    }

    console.log('🎉 Missing images added successfully!');

  } catch (error) {
    console.error('❌ Error adding missing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingImages();
