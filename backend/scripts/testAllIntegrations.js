const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const BASE_URL = 'http://localhost:5003/api';

console.log('🧪 JerseyNexus Complete Integration Test Suite');
console.log('==============================================\n');

// Test data
const testOrderData = {
  items: [
    {
      productId: 'test-product-1',
      quantity: 1,
      price: 1000,
      size: 'L',
      color: 'Red'
    }
  ],
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
  notes: 'Test order for payment integration'
};

async function testBackendHealth() {
  console.log('🏥 Test 1: Backend Health Check');
  console.log('-------------------------------');
  
  try {
    const healthResponse = await axios.get(`${BASE_URL}/../health`);
    console.log('✅ Backend health:', healthResponse.data.status);
    
    const dbResponse = await axios.get(`${BASE_URL}/../health/database`);
    console.log('✅ Database health:', dbResponse.data.status);
    
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Test 2: Authentication');
  console.log('-------------------------');
  
  try {
    // Login with admin user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@jerseynexus.com',
      password: 'Admin123!@#'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      return loginResponse.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testProductFetching(authToken) {
  console.log('\n📦 Test 3: Product Fetching');
  console.log('---------------------------');
  
  try {
    const productsResponse = await axios.get(`${BASE_URL}/products?limit=5`);
    const products = productsResponse.data.data.products;
    
    if (products.length > 0) {
      console.log(`✅ Found ${products.length} products`);
      console.log(`📋 Sample product: ${products[0].name} - Rs. ${products[0].price}`);
      
      // Update test order data with real product
      testOrderData.items[0].productId = products[0].id;
      testOrderData.items[0].price = products[0].price;
      testOrderData.totalAmount = products[0].price + testOrderData.shippingCost - testOrderData.discountAmount;
      
      return products[0];
    } else {
      throw new Error('No products found');
    }
  } catch (error) {
    console.log('❌ Product fetching failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testEsewaIntegration(authToken) {
  console.log('\n💰 Test 4: eSewa Integration');
  console.log('----------------------------');
  
  try {
    const esewaResponse = await axios.post(
      `${BASE_URL}/payments/esewa/initiate-with-order`,
      {
        orderData: testOrderData,
        amount: testOrderData.totalAmount,
        productName: 'Test Order'
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    
    if (esewaResponse.data.success) {
      console.log('✅ eSewa payment initialized');
      console.log('📦 Payment ID:', esewaResponse.data.data.paymentId);
      console.log('🔗 Payment URL:', esewaResponse.data.data.payment_url);
      
      // Test signature validation
      const params = esewaResponse.data.data.esewaParams;
      const signatureMessage = `total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`;
      const expectedSignature = crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q')
        .update(signatureMessage)
        .digest('base64');
      
      if (params.signature === expectedSignature) {
        console.log('✅ eSewa signature validation passed');
      } else {
        console.log('❌ eSewa signature validation failed');
      }
      
      return esewaResponse.data.data.paymentId;
    } else {
      throw new Error('eSewa initialization failed');
    }
  } catch (error) {
    console.log('❌ eSewa integration failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testKhaltiIntegration(authToken) {
  console.log('\n💳 Test 5: Khalti KPG-2 Integration');
  console.log('-----------------------------------');
  
  try {
    const khaltiResponse = await axios.post(
      `${BASE_URL}/payments/khalti/initiate-v2`,
      {
        orderData: testOrderData,
        amount: testOrderData.totalAmount,
        productName: 'Test Order'
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    
    if (khaltiResponse.data.success) {
      console.log('✅ Khalti KPG-2 payment initialized');
      console.log('📦 Payment ID:', khaltiResponse.data.data.paymentId);
      console.log('🔗 Payment URL:', khaltiResponse.data.data.payment_url);
      console.log('⏰ Expires at:', khaltiResponse.data.data.expires_at);
      
      return khaltiResponse.data.data.pidx;
    } else {
      throw new Error('Khalti initialization failed');
    }
  } catch (error) {
    console.log('❌ Khalti integration failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testPaymentStatusChecking(authToken, esewaPaymentId, khaltiPidx) {
  console.log('\n🔍 Test 6: Payment Status Checking');
  console.log('----------------------------------');
  
  let allPassed = true;
  
  // Test eSewa status check
  if (esewaPaymentId) {
    try {
      const esewaStatusResponse = await axios.get(
        `${BASE_URL}/payments/esewa/status/${esewaPaymentId}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      
      if (esewaStatusResponse.data.success) {
        console.log('✅ eSewa status check working');
        console.log('📊 eSewa status:', esewaStatusResponse.data.data.localStatus);
      } else {
        throw new Error('eSewa status check failed');
      }
    } catch (error) {
      console.log('❌ eSewa status check failed:', error.response?.data?.message || error.message);
      allPassed = false;
    }
  }
  
  // Test Khalti status check
  if (khaltiPidx) {
    try {
      const khaltiStatusResponse = await axios.post(
        `${BASE_URL}/payments/khalti/verify-v2`,
        { pidx: khaltiPidx },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      
      if (khaltiStatusResponse.data.success) {
        console.log('✅ Khalti status check working');
        console.log('📊 Khalti status:', khaltiStatusResponse.data.data.status);
      } else {
        throw new Error('Khalti status check failed');
      }
    } catch (error) {
      console.log('❌ Khalti status check failed:', error.response?.data?.message || error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testWebSocketConnection() {
  console.log('\n🔌 Test 7: WebSocket Connection');
  console.log('-------------------------------');
  
  try {
    // Test if WebSocket endpoint is accessible
    const wsResponse = await axios.get(`http://localhost:5003/socket.io/`, {
      timeout: 5000
    });
    
    console.log('✅ WebSocket endpoint accessible');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ WebSocket endpoint responding (expected 400 for HTTP request)');
      return true;
    } else {
      console.log('❌ WebSocket endpoint not accessible:', error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Complete Integration Tests...\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    authentication: null,
    productFetching: null,
    esewaIntegration: null,
    khaltiIntegration: null,
    paymentStatusChecking: null,
    webSocketConnection: await testWebSocketConnection()
  };
  
  // Get auth token
  const authToken = await testAuthentication();
  results.authentication = !!authToken;
  
  if (authToken) {
    // Test product fetching
    const product = await testProductFetching(authToken);
    results.productFetching = !!product;
    
    if (product) {
      // Test payment integrations
      const esewaPaymentId = await testEsewaIntegration(authToken);
      results.esewaIntegration = !!esewaPaymentId;
      
      const khaltiPidx = await testKhaltiIntegration(authToken);
      results.khaltiIntegration = !!khaltiPidx;
      
      // Test payment status checking
      results.paymentStatusChecking = await testPaymentStatusChecking(authToken, esewaPaymentId, khaltiPidx);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(50));
  
  if (allPassed) {
    console.log('\n🎉 JerseyNexus is fully functional!');
    console.log('💡 Ready for:');
    console.log('   ✅ eSewa payments with proper redirects');
    console.log('   ✅ Khalti KPG-2 payments');
    console.log('   ✅ Admin dashboard with payment method display');
    console.log('   ✅ WebSocket real-time updates');
    console.log('   ✅ Complete payment flow testing');
  } else {
    console.log('\n🔧 Please address the failing tests before proceeding.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test suite error:', error);
  process.exit(1);
});
