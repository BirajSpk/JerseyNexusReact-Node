const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const dummyProducts = [
  {
    name: 'Manchester United Home Jersey 2024',
    description: 'Official Manchester United home jersey for the 2024 season. Made with premium quality fabric and featuring the iconic red design.',
    price: 2500,
    salePrice: 2200,
    stock: 15,
    slug: 'manchester-united-home-jersey-2024',
    featured: true,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://assets.adidas.com/images/w_1880,f_auto,q_auto/fc3273f7cd9a442694051098a5e1413e_9366/IN3520_HM30.jpg',
        altText: 'Manchester United Home Jersey 2024',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Red', code: '#FF0000' },
      { name: 'White', code: '#FFFFFF' }
    ])
  },
  {
    name: 'Real Madrid Away Jersey 2024',
    description: 'Official Real Madrid away jersey featuring the classic white design with modern touches.',
    price: 2700,
    salePrice: 2400,
    stock: 12,
    slug: 'real-madrid-away-jersey-2024',
    featured: true,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://us.shop.realmadrid.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F7nqb12anqb19%2F1zb7Ub8dPw0ZYgDgIPbzNI%2F2b573e0339b52e056928dfa6044b4e78%2FCOLLECTION-BANNER-HOME-KIT-25-26-MOBILE.jpg&w=1920&q=75',
        altText: 'Real Madrid Away Jersey 2024',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'White', code: '#FFFFFF' },
      { name: 'Navy', code: '#000080' }
    ])
  },
  {
    name: 'Lakers LeBron James Jersey',
    description: 'Official Los Angeles Lakers LeBron James basketball jersey in iconic purple and gold.',
    price: 3200,
    salePrice: 2800,
    stock: 8,
    slug: 'lakers-lebron-james-jersey',
    featured: false,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTftC0gFUOn6VYdT15W6Sw1c8-L-2Zisnl8Zw&s',
        altText: 'Lakers LeBron James Jersey',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([
      { name: 'Purple', code: '#552583' },
      { name: 'Gold', code: '#FDB927' }
    ])
  },
  {
    name: 'India Cricket Team Jersey 2024',
    description: 'Official India cricket team jersey in the classic blue color with modern design elements.',
    price: 1800,
    salePrice: 1600,
    stock: 25,
    slug: 'india-cricket-team-jersey-2024',
    featured: true,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/cce1c39d9325449c8d3ffd06b332fc30_9366/t20-international-cricket-jersey.jpg',
        altText: 'India Cricket Team Jersey 2024',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Blue', code: '#0066CC' },
      { name: 'Orange', code: '#FF6600' }
    ])
  },
  {
    name: 'Barcelona Training Kit 2024',
    description: 'Official FC Barcelona training kit with moisture-wicking technology for optimal performance.',
    price: 2200,
    salePrice: 1900,
    stock: 18,
    slug: 'barcelona-training-kit-2024',
    featured: false,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2023%2F06%2Fbarcelona-nike-new-football-home-jersey-6.jpg?q=75&w=800&cbr=1&fit=max',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Blue', code: '#004D98' },
      { name: 'Red', code: '#DC143C' }
    ])
  },
  {
    name: 'Golden State Warriors Curry Jersey',
    description: 'Official Golden State Warriors Stephen Curry jersey in the classic blue and gold design.',
    price: 3500,
    salePrice: 3100,
    stock: 6,
    slug: 'golden-state-warriors-curry-jersey',
    featured: true,
    status: 'ACTIVE',
    images: JSON.stringify([
      {
        url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=400&fit=crop',
        altText: 'Golden State Warriors Curry Jersey',
        isPrimary: true
      }
    ]),
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify([
      { name: 'Blue', code: '#1D428A' },
      { name: 'Gold', code: '#FFC72C' }
    ])
  }
];

const dummyCategories = [
  {
    name: 'Football Jerseys',
    slug: 'football-jerseys',
    type: 'PRODUCT'
  },
  {
    name: 'Basketball Jerseys',
    slug: 'basketball-jerseys',
    type: 'PRODUCT'
  },
  {
    name: 'Cricket Jerseys',
    slug: 'cricket-jerseys',
    type: 'PRODUCT'
  },
  {
    name: 'Training Wear',
    slug: 'training-wear',
    type: 'PRODUCT'
  }
];

async function seedDummyData() {
  try {
    console.log('🌱 Starting to seed dummy data...');

    // Create categories first
    console.log('📁 Creating categories...');
    const createdCategories = [];
    for (const category of dummyCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (!existingCategory) {
        const newCategory = await prisma.category.create({
          data: category
        });
        createdCategories.push(newCategory);
        console.log(`✅ Created category: ${newCategory.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`⏭️  Category already exists: ${existingCategory.name}`);
      }
    }

    // Create products
    console.log('🛍️  Creating products...');
    for (let i = 0; i < dummyProducts.length; i++) {
      const product = dummyProducts[i];
      const categoryIndex = i % createdCategories.length;
      
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({
          data: {
            ...product,
            categoryId: createdCategories[categoryIndex].id
          }
        });
        console.log(`✅ Created product: ${newProduct.name}`);
      } else {
        console.log(`⏭️  Product already exists: ${existingProduct.name}`);
      }
    }

    // Create admin user if doesn't exist
    console.log('👤 Creating admin user...');
    const adminEmail = 'admin@jerseynexus.com';
    const adminPassword = 'nt';
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log(`✅ Created admin user: ${admin.email}`);
    } else {
      console.log(`⏭️  Admin user already exists: ${existingAdmin.email}`);
    }

    console.log('🎉 Dummy data seeding completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedDummyData, dummyProducts, dummyCategories };
