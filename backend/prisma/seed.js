const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!@#', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jerseynexus.com' },
    update: {},
    create: {
      email: 'admin@jerseynexus.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const productCategory = await prisma.category.upsert({
    where: { slug: 'football-jerseys' },
    update: {},
    create: {
      name: 'Football Jerseys',
      slug: 'football-jerseys',
      type: 'PRODUCT',
      description: 'Professional football jerseys from top teams',
    },
  });

  const blogCategory = await prisma.category.upsert({
    where: { slug: 'football-news' },
    update: {},
    create: {
      name: 'Football News',
      slug: 'football-news',
      type: 'BLOG',
      description: 'Latest news and updates from the football world',
    },
  });

  console.log('✅ Categories created');

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: 'Manchester United Home Jersey 2024',
      description: 'Official Manchester United home jersey for the 2024 season',
      price: 89.99,
      salePrice: 79.99,
      stock: 50,
      categoryId: productCategory.id,
      slug: 'manchester-united-home-jersey-2024',
      metaTitle: 'Manchester United Home Jersey 2024 - Official',
      metaDescription: 'Get the official Manchester United home jersey for 2024',
      featured: true,
      status: 'ACTIVE',
    },
  });

  // Add images to the product
  await prisma.productImage.createMany({
    data: [
      {
        productId: product1.id,
        url: '/uploads/products/man-utd-home-front.jpg',
        altText: 'Manchester United Home Jersey - Front',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        productId: product1.id,
        url: '/uploads/products/man-utd-home-back.jpg',
        altText: 'Manchester United Home Jersey - Back',
        isPrimary: false,
        sortOrder: 1,
      },
    ],
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Barcelona Away Jersey 2024',
      description: 'Official Barcelona away jersey for the 2024 season',
      price: 94.99,
      salePrice: 84.99,
      stock: 30,
      categoryId: productCategory.id,
      slug: 'barcelona-away-jersey-2024',
      metaTitle: 'Barcelona Away Jersey 2024 - Official',
      metaDescription: 'Get the official Barcelona away jersey for 2024',
      featured: true,
      status: 'ACTIVE',
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: product2.id,
        url: '/uploads/products/barcelona-away-front.jpg',
        altText: 'Barcelona Away Jersey - Front',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        productId: product2.id,
        url: '/uploads/products/barcelona-away-back.jpg',
        altText: 'Barcelona Away Jersey - Back',
        isPrimary: false,
        sortOrder: 1,
      },
    ],
  });

  console.log('✅ Sample products created');

  // Create sample blog
  const blog = await prisma.blog.create({
    data: {
      title: 'Top 10 Football Jerseys of 2024',
      content: 'Discover the most popular and stylish football jerseys of the 2024 season...',
      categoryId: blogCategory.id,
      authorId: admin.id,
      slug: 'top-10-football-jerseys-2024',
      published: true,
      status: 'PUBLISHED',
      metaTitle: 'Top 10 Football Jerseys of 2024',
      metaDescription: 'Explore the best football jerseys of 2024',
      featuredImage: '/uploads/blogs/top-jerseys-2024.jpg',
    },
  });

  console.log('✅ Sample blog created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
