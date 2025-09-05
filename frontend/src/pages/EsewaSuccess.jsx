import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paymentAPI } from '../utils/api';

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processEsewaCallback = async () => {
      try {
        // Get the base64 encoded data from URL
        const encodedData = searchParams.get('data');
        
        if (!encodedData) {
          throw new Error('No payment data received from eSewa');
        }

        console.log('📦 eSewa callback received with data:', encodedData);

        // Decode the base64 data
        const decodedData = JSON.parse(atob(encodedData));
        console.log('🔓 Decoded eSewa response:', decodedData);

        setPaymentData(decodedData);

        // Verify the payment with backend
        if (decodedData.status === 'COMPLETE') {
          const verificationResponse = await paymentAPI.verifyEsewa({
            transaction_uuid: decodedData.transaction_uuid,
            total_amount: decodedData.total_amount,
            product_code: decodedData.product_code
          });

          if (verificationResponse.data.success) {
            toast.success('🎉 eSewa payment verified successfully!');
            
            // Redirect to order success page after 3 seconds
            const orderId = verificationResponse.data.data.orderId;
            setTimeout(() => {
              navigate(`/order-success?orderId=${orderId}&transactionId=${decodedData.transaction_code}&paymentMethod=esewa`);
            }, 3000);
          } else {
            throw new Error('Payment verification failed');
          }
        } else {
          throw new Error(`Payment status: ${decodedData.status}`);
        }

      } catch (error) {
        console.error('❌ eSewa callback processing error:', error);
        setError(error.message);
        toast.error(`eSewa payment failed: ${error.message}`);
        
        // Redirect to failure page after 3 seconds
        setTimeout(() => {
          navigate('/payment/esewa/failed', { 
            state: { 
              error: error.message,
              paymentMethod: 'eSewa'
            }
          });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processEsewaCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {isProcessing ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600 mb-6">Please wait while we verify your eSewa payment...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your eSewa payment has been processed successfully.</p>
            
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Transaction ID:</span> {paymentData.transaction_code}</p>
                  <p><span className="font-medium">Amount:</span> Rs. {paymentData.total_amount}</p>
                  <p><span className="font-medium">Status:</span> {paymentData.status}</p>
                  <p><span className="font-medium">Payment Method:</span> eSewa</p>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              Redirecting to order confirmation in a few seconds...
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EsewaSuccess;
