const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBackImages() {
  try {
    console.log('🖼️ Adding back images to products...');

    // Get all products that have front images but no back images
    const products = await prisma.product.findMany({
      include: {
        productImages: true
      }
    });

    for (const product of products) {
      console.log(`Checking product: ${product.name}`);
      console.log(`  - Has ${product.productImages.length} images`);

      const hasBackImage = product.productImages.some(img => img.sortOrder === 1);
      console.log(`  - Has back image: ${hasBackImage}`);

      if (product.productImages.length > 0 && !hasBackImage) {
        // Add a back image
        const backImageUrls = [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop'
        ];

        const randomBackImage = backImageUrls[Math.floor(Math.random() * backImageUrls.length)];

        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: randomBackImage,
            altText: `${product.name} - Back`,
            isPrimary: false,
            sortOrder: 1
          }
        });

        console.log(`✅ Added back image to: ${product.name}`);
      } else if (product.productImages.length === 0) {
        console.log(`  - No images at all, skipping: ${product.name}`);
      } else {
        console.log(`  - Already has back image: ${product.name}`);
      }
    }

    console.log('🎉 Back images added successfully!');

  } catch (error) {
    console.error('❌ Error adding back images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBackImages();
