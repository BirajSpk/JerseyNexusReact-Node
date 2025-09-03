import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import EsewaPayment from '../components/EsewaPayment';
import { paymentAPI } from '../utils/api';

const EsewaTest = () => {
  const [testMode, setTestMode] = useState('component');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Sample order data for testing
  const sampleOrderData = {
    items: [
      {
        productId: 'test-product-1',
        quantity: 2,
        price: 500,
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
    notes: 'Test order for eSewa integration'
  };

  const handleManualTest = async () => {
    setIsLoading(true);
    setPaymentResult(null);

    try {
      console.log('🔄 Starting manual eSewa test...');
      
      const response = await paymentAPI.initiateEsewaWithOrderData({
        orderData: sampleOrderData,
        amount: sampleOrderData.totalAmount,
        productName: 'JerseyNexus Test Order'
      });

      if (response.data.success) {
        const { payment_url, esewaParams, paymentId } = response.data.data;
        
        console.log('✅ eSewa payment initialized:', { payment_url, esewaParams, paymentId });
        
        setPaymentResult({
          success: true,
          paymentId,
          formUrl: payment_url,
          params: esewaParams
        });

        toast.success('eSewa payment initialized! Check the form below.');
      } else {
        throw new Error(response.data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('❌ Manual test error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize eSewa payment');
      setPaymentResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitEsewaForm = (formUrl, params) => {
    console.log('📝 Submitting eSewa form...');
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = formUrl;
    form.target = '_blank'; // Open in new tab for testing

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast.success('Form submitted! Check the new tab for eSewa payment.');
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await paymentAPI.checkEsewaStatus(paymentId);
      console.log('📊 Payment status:', response.data);
      toast.success(`Payment status: ${response.data.data.esewaStatus}`);
      return response.data;
    } catch (error) {
      console.error('❌ Status check error:', error);
      toast.error('Failed to check payment status');
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">eSewa Integration Test</h1>
        
        {/* Test Mode Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Test Mode</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setTestMode('component')}
              className={`px-4 py-2 rounded ${
                testMode === 'component'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Component Test
            </button>
            <button
              onClick={() => setTestMode('manual')}
              className={`px-4 py-2 rounded ${
                testMode === 'manual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Manual Test
            </button>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Credentials</h3>
          <div className="text-sm text-yellow-700">
            <p><strong>eSewa ID:</strong> 9806800001, 9806800002, 9806800003, 9806800004, 9806800005</p>
            <p><strong>Password:</strong> Nepal@123</p>
            <p><strong>MPIN:</strong> 1122 (for mobile app)</p>
            <p><strong>Token:</strong> 123456 (fixed for testing)</p>
          </div>
        </div>

        {/* Sample Order Data */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Sample Order Data</h3>
          <div className="bg-gray-50 p-4 rounded text-sm">
            <pre>{JSON.stringify(sampleOrderData, null, 2)}</pre>
          </div>
        </div>

        {/* Component Test */}
        {testMode === 'component' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">EsewaPayment Component Test</h3>
            <div className="border border-gray-200 rounded p-4">
              <EsewaPayment
                orderData={sampleOrderData}
                onSuccess={(data) => {
                  console.log('✅ Payment success:', data);
                  toast.success('Payment completed successfully!');
                  setPaymentResult({ success: true, data });
                }}
                onError={(error) => {
                  console.error('❌ Payment error:', error);
                  toast.error('Payment failed!');
                  setPaymentResult({ success: false, error });
                }}
              />
            </div>
          </div>
        )}

        {/* Manual Test */}
        {testMode === 'manual' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Manual API Test</h3>
            <button
              onClick={handleManualTest}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Initializing...' : 'Initialize eSewa Payment'}
            </button>

            {paymentResult && (
              <div className="mt-4">
                {paymentResult.success ? (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Payment Initialized Successfully</h4>
                    <p className="text-sm text-green-700 mb-3">Payment ID: {paymentResult.paymentId}</p>
                    
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => submitEsewaForm(paymentResult.formUrl, paymentResult.params)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Submit to eSewa
                      </button>
                      <button
                        onClick={() => checkPaymentStatus(paymentResult.paymentId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Check Status
                      </button>
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Form Parameters</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(paymentResult.params, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Payment Initialization Failed</h4>
                    <p className="text-sm text-red-700">{paymentResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Choose a test mode above</li>
            <li>2. Click "Initialize eSewa Payment" or use the component</li>
            <li>3. You'll be redirected to eSewa's test environment</li>
            <li>4. Use the test credentials provided above</li>
            <li>5. Complete the payment process</li>
            <li>6. You'll be redirected back to the success page</li>
            <li>7. Check the browser console for detailed logs</li>
          </ol>
        </div>

        {/* Backend Logs */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold text-gray-800 mb-2">Backend Monitoring</h3>
          <p className="text-sm text-gray-600">
            Monitor the backend console for detailed payment processing logs. 
            The backend will show signature generation, payment creation, and callback handling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EsewaTest;
