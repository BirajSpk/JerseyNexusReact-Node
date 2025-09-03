import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { paymentAPI } from '../utils/api';

const EsewaPayment = ({ orderData, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const initiateEsewaPayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Initiating eSewa payment with order data:', orderData);
      
      const response = await paymentAPI.initiateEsewaWithOrderData({
        orderData,
        amount: orderData.totalAmount,
        productName: `JerseyNexus Order`,
      });

      if (response.data.success) {
        const { payment_url, esewaParams } = response.data.data;
        setPaymentData({ payment_url, esewaParams });
        
        console.log('✅ eSewa payment initialized:', { payment_url, esewaParams });
        
        // Auto-submit the form to eSewa
        setTimeout(() => {
          submitEsewaForm(payment_url, esewaParams);
        }, 1000);
        
      } else {
        throw new Error(response.data.message || 'Failed to initialize eSewa payment');
      }
    } catch (error) {
      console.error('❌ eSewa payment initialization error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize eSewa payment');
      onError && onError(error);
      setIsProcessing(false);
    }
  };

  const submitEsewaForm = (paymentUrl, params) => {
    console.log('📝 Submitting eSewa form with params:', params);
    
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.style.display = 'none';

    // Add all parameters as hidden inputs
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Add form to document and submit
    document.body.appendChild(form);
    
    toast.success('🚀 Redirecting to eSewa Payment...', {
      duration: 2000,
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
    
    form.submit();
  };

  const checkPaymentStatus = async (transactionUuid) => {
    try {
      const response = await paymentAPI.checkEsewaStatus(transactionUuid);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking eSewa payment status:', error);
      return null;
    }
  };

  useEffect(() => {
    // Listen for payment completion messages from eSewa
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'ESEWA_PAYMENT_SUCCESS') {
        console.log('✅ eSewa payment success message received:', event.data);
        onSuccess && onSuccess(event.data);
      } else if (event.data.type === 'ESEWA_PAYMENT_FAILED') {
        console.log('❌ eSewa payment failed message received:', event.data);
        onError && onError(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  return (
    <div className="esewa-payment-container">
      {!paymentData && (
        <div className="text-center">
          <button
            onClick={initiateEsewaPayment}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Initializing eSewa Payment...</span>
              </>
            ) : (
              <>
                <img 
                  src="https://cdn.esewa.com.np/ui/images/logos/esewa-icon-large.png" 
                  alt="eSewa" 
                  className="h-6 w-6"
                />
                <span>Pay with eSewa</span>
              </>
            )}
          </button>
        </div>
      )}

      {paymentData && (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
              <span>Redirecting to eSewa...</span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              You will be redirected to eSewa payment gateway shortly.
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>If you are not redirected automatically, click the button below:</p>
            <button
              onClick={() => submitEsewaForm(paymentData.payment_url, paymentData.esewaParams)}
              className="mt-2 text-green-600 hover:text-green-700 underline"
            >
              Continue to eSewa
            </button>
          </div>
        </div>
      )}

      {/* Debug information (only in development) */}
      {process.env.NODE_ENV === 'development' && paymentData && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(paymentData.esewaParams, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EsewaPayment;
