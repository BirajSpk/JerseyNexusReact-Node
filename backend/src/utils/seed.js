const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jerseynexus.com' },
    update: {},
    create: {
      name: 'JerseyNexus Admin',
      email: 'admin@jerseynexus.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const productCategories = [
    { name: 'Football Jerseys', slug: 'football-jerseys' },
    { name: 'Basketball Jerseys', slug: 'basketball-jerseys' },
    { name: 'Cricket Jerseys', slug: 'cricket-jerseys' },
    { name: 'Training Wear', slug: 'training-wear' },
    { name: 'Sports Accessories', slug: 'sports-accessories' },
  ];

  const blogCategories = [
    { name: 'Sports News', slug: 'sports-news', type: 'BLOG' },
    { name: 'Player Updates', slug: 'player-updates', type: 'BLOG' },
    { name: 'Product Reviews', slug: 'product-reviews', type: 'BLOG' },
  ];

  for (const category of productCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        type: 'PRODUCT',
      },
    });
  }

  for (const category of blogCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        type: category.type,
      },
    });
  }

  console.log('✅ Categories created');

  // Get football category for sample products
  const footballCategory = await prisma.category.findUnique({
    where: { slug: 'football-jerseys' },
  });

  // Create sample products
  const sampleProducts = [
    {
      name: 'Manchester United Home Jersey 2024',
      description: 'Official Manchester United home jersey with premium quality fabric and authentic design.',
      price: 4500.00,
      stock: 50,
      slug: 'manchester-united-home-jersey-2024',
      metaTitle: 'Manchester United Home Jersey 2024 - JerseyNexus',
      metaDescription: 'Get the official Manchester United home jersey 2024 at JerseyNexus. Premium quality, authentic design.',
      categoryId: footballCategory.id,
      images: JSON.stringify([
        {
          url: '/uploads/man-utd-home.jpg',
          altText: 'Manchester United Home Jersey 2024',
          isPrimary: true
        }
      ]),
    },
    {
      name: 'Real Madrid Away Jersey 2024',
      description: 'Official Real Madrid away jersey with cutting-edge technology and premium materials.',
      price: 4800.00,
      stock: 30,
      slug: 'real-madrid-away-jersey-2024',
      metaTitle: 'Real Madrid Away Jersey 2024 - JerseyNexus',
      metaDescription: 'Shop the official Real Madrid away jersey 2024 at JerseyNexus. High-quality materials and authentic design.',
      categoryId: footballCategory.id,
      images: JSON.stringify([
        {
          url: '/uploads/real-madrid-away.jpg',
          altText: 'Real Madrid Away Jersey 2024',
          isPrimary: true
        }
      ]),
    },
    {
      name: 'Barcelona Home Jersey 2024',
      description: 'Official FC Barcelona home jersey featuring the iconic blaugrana colors.',
      price: 4600.00,
      stock: 40,
      slug: 'barcelona-home-jersey-2024',
      metaTitle: 'Barcelona Home Jersey 2024 - JerseyNexus',
      metaDescription: 'Buy the official Barcelona home jersey 2024 at JerseyNexus. Iconic blaugrana colors, premium quality.',
      categoryId: footballCategory.id,
      images: JSON.stringify([
        {
          url: '/uploads/barcelona-home.jpg',
          altText: 'Barcelona Home Jersey 2024',
          isPrimary: true
        }
      ]),
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('✅ Sample products created');

  // Create a sample blog post
  const blogCategory = await prisma.category.findUnique({
    where: { slug: 'sports-news' },
  });

  await prisma.blog.upsert({
    where: { slug: 'welcome-to-jerseynexus' },
    update: {},
    create: {
      title: 'Welcome to JerseyNexus - Your Premier Sports Destination',
      content: `<p>Welcome to JerseyNexus, Nepal's premier destination for authentic sportswear and jerseys!</p>
                <p>We are excited to bring you the finest collection of football, basketball, and cricket jerseys from top teams around the world.</p>
                <h2>Why Choose JerseyNexus?</h2>
                <ul>
                  <li>100% Authentic Products</li>
                  <li>Fast Delivery Across Nepal</li>
                  <li>Competitive Prices</li>
                  <li>Excellent Customer Service</li>
                </ul>
                <p>Contact us at +977 9811543215 for any queries!</p>`,
      slug: 'welcome-to-jerseynexus',
      metaTitle: 'Welcome to JerseyNexus - Premier Sports Destination in Nepal',
      metaDescription: 'Discover JerseyNexus, your go-to destination for authentic sportswear and jerseys in Nepal. Quality products, fast delivery.',
      published: true,
      categoryId: blogCategory.id,
      authorId: admin.id,
      images: JSON.stringify([
        {
          url: '/uploads/jerseynexus-welcome.jpg',
          altText: 'JerseyNexus Welcome Banner',
          isPrimary: true
        }
      ]),
    },
  });

  console.log('✅ Sample blog post created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });