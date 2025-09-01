#!/usr/bin/env node

/**
 * JerseyNexus Comprehensive Dummy Data Seeder
 * Uses the jersey images from frontend/src/images
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🏈 Seeding JerseyNexus with jersey images...');

  try {
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
    const footballCategory = await prisma.category.upsert({
      where: { slug: 'football-jerseys' },
      update: {},
      create: {
        name: 'Football Jerseys',
        slug: 'football-jerseys',
        type: 'PRODUCT',
      },
    });

    const trainingCategory = await prisma.category.upsert({
      where: { slug: 'training-wear' },
      update: {},
      create: {
        name: 'Training Wear',
        slug: 'training-wear',
        type: 'PRODUCT',
      },
    });

    const blogCategory = await prisma.category.upsert({
      where: { slug: 'sports-news' },
      update: {},
      create: {
        name: 'Sports News',
        slug: 'sports-news',
        type: 'BLOG',
      },
    });

    console.log('✅ Categories created');

    // Jersey products data based on your images
    const jerseyProducts = [
      {
        name: 'Arsenal Home Jersey 2025/26',
        description: 'Official Arsenal home jersey for the 2025/26 season. Premium quality fabric with authentic design and club crest. Perfect for match days and casual wear.',
        price: 4500.00,
        stock: 25,
        slug: 'arsenal-home-jersey-2526',
        metaTitle: 'Arsenal Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Buy the official Arsenal home jersey 2025/26 season at JerseyNexus. Premium quality, authentic design with fast delivery across Nepal.',
        categoryId: footballCategory.id,
        imageFile: 'Arsanel jersey 2526 home.png',
      },
      {
        name: 'Arsenal Away Jersey 2025/26',
        description: 'Official Arsenal away jersey for the 2025/26 season. Stylish away kit with modern design and superior comfort for true Gunners fans.',
        price: 4500.00,
        stock: 20,
        slug: 'arsenal-away-jersey-2526',
        metaTitle: 'Arsenal Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Shop the official Arsenal away jersey 2025/26 at JerseyNexus. Authentic away kit with premium materials.',
        categoryId: footballCategory.id,
        imageFile: 'Arsanel jersey 2526 away.png',
      },
      {
        name: 'Barcelona Home Jersey 2025/26',
        description: 'Official FC Barcelona home jersey featuring the iconic blaugrana colors. Premium quality with advanced fabric technology for ultimate comfort.',
        price: 4800.00,
        stock: 30,
        slug: 'barcelona-home-jersey-2526',
        metaTitle: 'Barcelona Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Get the official Barcelona home jersey 2025/26 at JerseyNexus. Iconic blaugrana colors with premium quality.',
        categoryId: footballCategory.id,
        imageFile: 'Barcelona jersey 2526 home.jpeg',
      },
      {
        name: 'Barcelona Away Jersey 2025/26',
        description: 'Official FC Barcelona away jersey for 2025/26 season. Stunning away design that represents the Catalan giants in style.',
        price: 4800.00,
        stock: 25,
        slug: 'barcelona-away-jersey-2526',
        metaTitle: 'Barcelona Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Buy the official Barcelona away jersey 2025/26 at JerseyNexus. Stunning design with authentic club details.',
        categoryId: footballCategory.id,
        imageFile: 'Barcelone jersey 2526 away.jpeg',
      },
      {
        name: 'Chelsea Home Jersey 2025/26',
        description: 'Official Chelsea FC home jersey in classic blue. Premium quality fabric with the iconic Chelsea badge and modern fit.',
        price: 4700.00,
        stock: 28,
        slug: 'chelsea-home-jersey-2526',
        metaTitle: 'Chelsea Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Shop the official Chelsea home jersey 2025/26 at JerseyNexus. Classic blue design with premium quality.',
        categoryId: footballCategory.id,
        imageFile: 'Chelsea jersey 2526 home.jpeg',
      },
      {
        name: 'Chelsea Away Jersey 2025/26',
        description: 'Official Chelsea FC away jersey for 2025/26 season. Stylish away kit that showcases the Blues modern identity.',
        price: 4700.00,
        stock: 22,
        slug: 'chelsea-away-jersey-2526',
        metaTitle: 'Chelsea Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Get the official Chelsea away jersey 2025/26 at JerseyNexus. Modern design with authentic club details.',
        categoryId: footballCategory.id,
        imageFile: 'Chelsea jersey 2526 away.jpeg',
      },
      {
        name: 'Manchester United Home Jersey 2025/26',
        description: 'Official Manchester United home jersey in classic red. Premium quality with the iconic United badge and superior comfort.',
        price: 4900.00,
        stock: 35,
        slug: 'manchester-united-home-jersey-2526',
        metaTitle: 'Manchester United Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Buy the official Manchester United home jersey 2025/26 at JerseyNexus. Classic red design with premium materials.',
        categoryId: footballCategory.id,
        imageFile: 'Manchester United Home 2526.jpg',
      },
      {
        name: 'Manchester United Away Jersey 2025/26',
        description: 'Official Manchester United away jersey for 2025/26 season. Stunning away design that represents the Red Devils heritage.',
        price: 4900.00,
        stock: 30,
        slug: 'manchester-united-away-jersey-2526',
        metaTitle: 'Manchester United Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Shop the official Manchester United away jersey 2025/26 at JerseyNexus. Premium away kit with authentic design.',
        categoryId: footballCategory.id,
        imageFile: 'Manchester United Away Jersey 2526.jpg',
      },
      {
        name: 'PSG Home Jersey 2025/26',
        description: 'Official Paris Saint-Germain home jersey in classic navy blue with red accents. Premium quality for true PSG supporters.',
        price: 4600.00,
        stock: 26,
        slug: 'psg-home-jersey-2526',
        metaTitle: 'PSG Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Get the official PSG home jersey 2025/26 at JerseyNexus. Classic navy design with premium quality.',
        categoryId: footballCategory.id,
        imageFile: 'PSG jersey 2526 home.png',
      },
      {
        name: 'PSG Away Jersey 2025/26',
        description: 'Official Paris Saint-Germain away jersey for 2025/26 season. Elegant away design that showcases Parisian style.',
        price: 4600.00,
        stock: 24,
        slug: 'psg-away-jersey-2526',
        metaTitle: 'PSG Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Buy the official PSG away jersey 2025/26 at JerseyNexus. Elegant away design with authentic details.',
        categoryId: footballCategory.id,
        imageFile: 'PSG jersey 2526 away.png',
      },
      {
        name: 'Real Madrid Home Jersey 2025/26',
        description: 'Official Real Madrid home jersey in iconic white. Premium quality fabric with the legendary Real Madrid badge.',
        price: 5000.00,
        stock: 32,
        slug: 'real-madrid-home-jersey-2526',
        metaTitle: 'Real Madrid Home Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Shop the official Real Madrid home jersey 2025/26 at JerseyNexus. Iconic white design with premium quality.',
        categoryId: footballCategory.id,
        imageFile: 'Real Madrid jersey 2526 home.jpeg',
      },
      {
        name: 'Real Madrid Away Jersey 2025/26',
        description: 'Official Real Madrid away jersey for 2025/26 season. Stunning away kit that represents Los Blancos excellence.',
        price: 5000.00,
        stock: 28,
        slug: 'real-madrid-away-jersey-2526',
        metaTitle: 'Real Madrid Away Jersey 2025/26 - Official | JerseyNexus',
        metaDescription: 'Get the official Real Madrid away jersey 2025/26 at JerseyNexus. Premium away kit with authentic design.',
        categoryId: footballCategory.id,
        imageFile: 'Real Madrid jersey 2526 away.jpeg',
      },
    ];

    // Create products and their images
    for (const productData of jerseyProducts) {
      // Create product
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          slug: productData.slug,
          metaTitle: productData.metaTitle,
          metaDescription: productData.metaDescription,
          categoryId: productData.categoryId,
        },
      });

      // Create product image
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: product.id,
          url: `/uploads/${productData.imageFile}`
        }
      });

      if (!existingImage) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: `/uploads/${productData.imageFile}`,
            altText: productData.name,
            isPrimary: true,
            sortOrder: 1,
          },
        });
      }

      console.log(`✅ Created product: ${product.name}`);
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@example.com',
        role: 'USER',
      },
      {
        name: 'Priya Gurung',
        email: 'priya@example.com',
        role: 'USER',
      },
      {
        name: 'Bikash Thapa',
        email: 'bikash@example.com',
        role: 'USER',
      },
    ];

    for (const userData of sampleUsers) {
      const userPassword = await bcrypt.hash('User123!@#', 12);
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: userPassword,
        },
      });
    }

    console.log('✅ Sample users created');

    // Create sample blog posts
    const blogPosts = [
      {
        title: 'Welcome to JerseyNexus - Nepal\'s Premier Jersey Destination',
        content: `<h1>Welcome to JerseyNexus!</h1>
                  <p>We are thrilled to welcome you to JerseyNexus, Nepal's premier destination for authentic football jerseys and sportswear.</p>
                  
                  <h2>Why Choose JerseyNexus?</h2>
                  <ul>
                    <li><strong>100% Authentic Products:</strong> All our jerseys are genuine and officially licensed</li>
                    <li><strong>Wide Selection:</strong> From Premier League to La Liga, we have jerseys from all major leagues</li>
                    <li><strong>Fast Delivery:</strong> Quick delivery across Nepal, from Kathmandu to Pokhara</li>
                    <li><strong>Competitive Prices:</strong> Best prices in Nepal with quality guarantee</li>
                    <li><strong>Local Support:</strong> Dedicated customer service in Nepali and English</li>
                  </ul>
                  
                  <h2>Our Jersey Collection</h2>
                  <p>Explore our extensive collection featuring jerseys from top clubs including:</p>
                  <ul>
                    <li>Manchester United - The Red Devils</li>
                    <li>Real Madrid - Los Blancos</li>
                    <li>Barcelona - Blaugrana</li>
                    <li>Chelsea - The Blues</li>
                    <li>Arsenal - The Gunners</li>
                    <li>PSG - Paris Saint-Germain</li>
                  </ul>
                  
                  <p>Contact us at <strong>+977 9811543215</strong> for any queries or visit our store in Kathmandu!</p>`,
        slug: 'welcome-to-jerseynexus-nepal',
        metaTitle: 'Welcome to JerseyNexus - Nepal\'s Premier Football Jersey Store',
        metaDescription: 'Discover JerseyNexus, your trusted destination for authentic football jerseys in Nepal. Quality products, fast delivery across Nepal.',
        published: true,
        categoryId: blogCategory.id,
        authorId: admin.id,
      },
      {
        title: '2025/26 Season Jerseys Now Available',
        content: `<h1>New Season, New Jerseys!</h1>
                  <p>The 2025/26 football season is here, and we're excited to announce that all the latest jerseys are now available at JerseyNexus!</p>
                  
                  <h2>What's New This Season?</h2>
                  <p>This season brings exciting new designs and technological advances:</p>
                  <ul>
                    <li><strong>Enhanced Fabric Technology:</strong> Better moisture-wicking and comfort</li>
                    <li><strong>Sustainable Materials:</strong> Eco-friendly production processes</li>
                    <li><strong>Modern Fits:</strong> Updated sizing for better comfort</li>
                    <li><strong>Bold Designs:</strong> Fresh takes on classic club colors</li>
                  </ul>
                  
                  <h2>Featured Teams</h2>
                  <p>Get your hands on the latest jerseys from:</p>
                  <ul>
                    <li>Manchester United's iconic red home kit</li>
                    <li>Real Madrid's legendary white jersey</li>
                    <li>Barcelona's classic blaugrana stripes</li>
                    <li>Chelsea's royal blue home design</li>
                    <li>Arsenal's cannon-emblazoned kit</li>
                    <li>PSG's stylish Parisian design</li>
                  </ul>
                  
                  <p>Pre-order now and get 10% off on your first purchase!</p>`,
        slug: '2025-26-season-jerseys-available',
        metaTitle: '2025/26 Season Football Jerseys Now Available at JerseyNexus',
        metaDescription: 'Get the latest 2025/26 season football jerseys at JerseyNexus. New designs from all major clubs now available in Nepal.',
        published: true,
        categoryId: blogCategory.id,
        authorId: admin.id,
      },
    ];

    for (const blogData of blogPosts) {
      await prisma.blog.upsert({
        where: { slug: blogData.slug },
        update: {},
        create: blogData,
      });
    }

    console.log('✅ Sample blog posts created');

    // Create some sample reviews
    const products = await prisma.product.findMany();
    const users = await prisma.user.findMany({ where: { role: 'USER' } });

    const sampleReviews = [
      {
        rating: 5,
        comment: 'Excellent quality jersey! Exactly as described and fits perfectly. Fast delivery to Kathmandu.',
        userId: users[0]?.id,
        productId: products[0]?.id,
      },
      {
        rating: 4,
        comment: 'Great jersey, good quality fabric. Would definitely recommend JerseyNexus to other football fans.',
        userId: users[1]?.id,
        productId: products[1]?.id,
      },
      {
        rating: 5,
        comment: 'Amazing Real Madrid jersey! Authentic quality and quick delivery. Very satisfied with my purchase.',
        userId: users[2]?.id,
        productId: products[2]?.id,
      },
    ];

    for (const reviewData of sampleReviews) {
      if (reviewData.userId && reviewData.productId) {
        await prisma.review.create({
          data: reviewData,
        });
      }
    }

    console.log('✅ Sample reviews created');
    console.log('🎉 Database seeded successfully with jersey data!');
    console.log(`📊 Created ${jerseyProducts.length} products with images`);
    console.log(`👥 Created ${sampleUsers.length} sample users`);
    console.log(`📝 Created ${blogPosts.length} blog posts`);
    console.log(`⭐ Created ${sampleReviews.length} sample reviews`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
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