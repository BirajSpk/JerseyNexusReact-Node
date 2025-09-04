const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestProduct() {
  try {
    console.log('🏗️ Creating test product with local images...');

    // First, get a category
    const category = await prisma.category.findFirst();
    if (!category) {
      console.error('❌ No categories found. Please create a category first.');
      return;
    }

    // Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Jersey with Front/Back Images',
        description: 'This is a test jersey to demonstrate front and back image functionality.',
        price: 2500,
        salePrice: 2000,
        stock: 10,
        categoryId: category.id,
        slug: 'test-jersey-front-back-images',
        metaTitle: 'Test Jersey - Front/Back Images',
        metaDescription: 'Test jersey with front and back images for demonstration.',
        featured: true,
        status: 'ACTIVE'
      }
    });

    console.log('✅ Product created:', product.name);

    // Add front and back images
    const images = [
      {
        productId: product.id,
        url: '/uploads/products/product-1756838098663-891465486.jpg',
        altText: 'Test Jersey - Front View',
        isPrimary: true,
        sortOrder: 0
      },
      {
        productId: product.id,
        url: '/uploads/products/product-1756838098672-275710197.jpg',
        altText: 'Test Jersey - Back View',
        isPrimary: false,
        sortOrder: 1
      }
    ];

    await prisma.productImage.createMany({
      data: images
    });

    console.log('✅ Images added to product');

    // Fetch the complete product with images
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        productImages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log('🎉 Test product created successfully!');
    console.log('📦 Product ID:', completeProduct.id);
    console.log('🖼️ Images:', completeProduct.productImages.length);
    console.log('🔗 Frontend URL: http://localhost:3000/products/' + completeProduct.id);

  } catch (error) {
    console.error('❌ Error creating test product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProduct();
