const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProductsWithImages() {
  try {
    console.log('🏗️ Adding products with images...');

    // Get the product category
    const category = await prisma.category.findFirst({
      where: { type: 'PRODUCT' }
    });

    if (!category) {
      console.error('❌ No product categories found.');
      return;
    }

    // Create products with images
    const products = [
      {
        name: 'Manchester United Home Jersey 2024',
        description: 'Official Manchester United home jersey for the 2024 season. Made with premium materials for comfort and durability.',
        price: 89.99,
        salePrice: 79.99,
        stock: 25,
        slug: 'manchester-united-home-jersey-2024',
        metaTitle: 'Manchester United Home Jersey 2024 - Official',
        metaDescription: 'Get the official Manchester United home jersey for 2024',
        featured: true,
        status: 'ACTIVE',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
            altText: 'Manchester United Home Jersey - Front',
            isPrimary: true,
            sortOrder: 0
          },
          {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
            altText: 'Manchester United Home Jersey - Back',
            isPrimary: false,
            sortOrder: 1
          }
        ]
      },
      {
        name: 'Barcelona Away Jersey 2024',
        description: 'Official Barcelona away jersey for the 2024 season. Features the iconic club colors and modern design.',
        price: 94.99,
        salePrice: 84.99,
        stock: 20,
        slug: 'barcelona-away-jersey-2024',
        metaTitle: 'Barcelona Away Jersey 2024 - Official',
        metaDescription: 'Get the official Barcelona away jersey for 2024',
        featured: true,
        status: 'ACTIVE',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop',
            altText: 'Barcelona Away Jersey - Front',
            isPrimary: true,
            sortOrder: 0
          },
          {
            url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=600&fit=crop',
            altText: 'Barcelona Away Jersey - Back',
            isPrimary: false,
            sortOrder: 1
          }
        ]
      },
      {
        name: 'Real Madrid Third Jersey 2024',
        description: 'Official Real Madrid third jersey for the 2024 season. Unique design with premium quality materials.',
        price: 99.99,
        salePrice: 89.99,
        stock: 15,
        slug: 'real-madrid-third-jersey-2024',
        metaTitle: 'Real Madrid Third Jersey 2024 - Official',
        metaDescription: 'Get the official Real Madrid third jersey for 2024',
        featured: true,
        status: 'ACTIVE',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
            altText: 'Real Madrid Third Jersey - Front',
            isPrimary: true,
            sortOrder: 0
          },
          {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
            altText: 'Real Madrid Third Jersey - Back',
            isPrimary: false,
            sortOrder: 1
          }
        ]
      }
    ];

    for (const productData of products) {
      const { images, ...productInfo } = productData;
      
      // Create product
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          categoryId: category.id
        }
      });

      // Add images
      await prisma.productImage.createMany({
        data: images.map(img => ({
          ...img,
          productId: product.id
        }))
      });

      console.log(`✅ Created product: ${product.name}`);
    }

    console.log('🎉 All products with images created successfully!');

  } catch (error) {
    console.error('❌ Error creating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductsWithImages();
