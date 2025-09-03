const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5003/api';

// Test data - will be populated with actual product IDs
let testOrderData = {
  items: [],
  totalAmount: 1000,
  shippingCost: 100,
  discountAmount: 0,
  shippingAddress: {
    name: 'Test User',
    phone: '9800000000',
    address: 'Test Address',
    city: 'Kathmandu',
    postalCode: '44600',
    country: 'Nepal'
  },
  notes: 'Test order for eSewa integration'
};

async function testEsewaPaymentInitiation() {
  console.log('🧪 Testing eSewa Payment API');
  console.log('============================\n');

  try {
    // Test 1: Health check
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${BASE_URL}/../health`);
    console.log('✅ Backend is healthy:', healthResponse.data.status);

    // Test 2: eSewa payment initiation without auth (should fail)
    console.log('\n2. Testing eSewa payment initiation (without auth)...');
    try {
      await axios.post(`${BASE_URL}/payments/esewa/initiate-with-order`, {
        orderData: testOrderData,
        amount: testOrderData.totalAmount,
        productName: 'Test Order'
      });
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Get available products
    console.log('\n3. Fetching available products...');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products?limit=5`);
      const products = productsResponse.data.data.products;

      if (products.length === 0) {
        console.log('❌ No products found in database');
        return;
      }

      // Use the first product for testing
      const testProduct = products[0];
      testOrderData.items = [
        {
          productId: testProduct.id,
          quantity: 1,
          price: testProduct.price,
          size: 'L',
          color: 'Red'
        }
      ];
      testOrderData.totalAmount = testProduct.price + testOrderData.shippingCost - testOrderData.discountAmount;

      console.log('✅ Using product for test:', testProduct.name);
    } catch (error) {
      console.log('❌ Failed to fetch products:', error.response?.data?.message || error.message);
      return;
    }

    // Test 4: Login with admin user (created during seeding)
    console.log('\n4. Logging in with admin user...');
    const adminCredentials = {
      email: 'admin@jerseynexus.com',
      password: 'Admin123!@#'
    };

    let authToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, adminCredentials);
      authToken = loginResponse.data.data.token;
      console.log('✅ Admin user authenticated successfully');
    } catch (error) {
      console.log('❌ Failed to login admin user:', error.response?.data?.message || error.message);
      return;
    }

    // Test 5: eSewa payment initiation with auth
    console.log('\n5. Testing eSewa payment initiation (with auth)...');
    try {
      const paymentResponse = await axios.post(
        `${BASE_URL}/payments/esewa/initiate-with-order`,
        {
          orderData: testOrderData,
          amount: testOrderData.totalAmount,
          productName: 'Test Order'
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paymentResponse.data.success) {
        console.log('✅ eSewa payment initiated successfully');
        console.log('📦 Payment ID:', paymentResponse.data.data.paymentId);
        console.log('🔗 Payment URL:', paymentResponse.data.data.payment_url);
        
        // Display form parameters
        console.log('\n📋 eSewa Form Parameters:');
        const params = paymentResponse.data.data.esewaParams;
        Object.entries(params).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });

        // Test 6: Check payment status
        console.log('\n6. Testing payment status check...');
        try {
          const statusResponse = await axios.get(
            `${BASE_URL}/payments/esewa/status/${paymentResponse.data.data.paymentId}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
          console.log('✅ Payment status check working');
          console.log('📊 Status:', statusResponse.data.data.localStatus);
        } catch (statusError) {
          console.log('❌ Payment status check failed:', statusError.response?.data?.message || statusError.message);
        }

      } else {
        console.log('❌ eSewa payment initiation failed:', paymentResponse.data.message);
      }
    } catch (error) {
      console.log('❌ eSewa payment initiation error:', error.response?.data?.message || error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 eSewa API Test Complete');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('💥 Test suite error:', error.message);
  }
}

// Run the test
testEsewaPaymentInitiation();
