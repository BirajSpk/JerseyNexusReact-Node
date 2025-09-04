import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paymentAPI } from '../utils/api';

const KhaltiSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processKhaltiCallback = async () => {
      try {
        const pidx = searchParams.get('pidx');
        const transactionId = searchParams.get('transaction_id');
        const amount = searchParams.get('amount');

        if (!pidx) {
          throw new Error('No payment identifier received from Khalti');
        }

        console.log('📦 Khalti callback received:', { pidx, transactionId, amount });

        setPaymentData({ pidx, transactionId, amount });

        // Verify the payment with backend using KPG-2 lookup
        const verificationResponse = await paymentAPI.verifyKhaltiV2({ pidx });

        if (verificationResponse.data.success) {
          const lookupData = verificationResponse.data.data;
          
          if (lookupData.status === 'Completed') {
            toast.success('🎉 Khalti payment verified successfully!');
            
            // Redirect to order success page after 3 seconds
            setTimeout(() => {
              navigate('/orders', { 
                state: { 
                  paymentSuccess: true, 
                  paymentMethod: 'Khalti',
                  transactionId: lookupData.transaction_id,
                  pidx: pidx
                }
              });
            }, 3000);
          } else {
            throw new Error(`Payment verification failed. Status: ${lookupData.status}`);
          }
        } else {
          throw new Error('Payment verification failed');
        }

      } catch (error) {
        console.error('❌ Khalti callback processing error:', error);
        setError(error.message);
        toast.error(`Khalti payment failed: ${error.message}`);
        
        // Redirect to failure page after 3 seconds
        setTimeout(() => {
          navigate('/payment/khalti/failed', { 
            state: { 
              error: error.message,
              paymentMethod: 'Khalti'
            }
          });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processKhaltiCallback();
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
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600 mb-6">Please wait while we verify your Khalti payment...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your Khalti payment has been processed successfully.</p>
            
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Transaction ID:</span> {paymentData.transactionId}</p>
                  <p><span className="font-medium">Payment ID:</span> {paymentData.pidx}</p>
                  <p><span className="font-medium">Amount:</span> Rs. {paymentData.amount ? (paymentData.amount / 100).toFixed(2) : 'N/A'}</p>
                  <p><span className="font-medium">Payment Method:</span> Khalti</p>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              Redirecting to your orders in a few seconds...
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KhaltiSuccess;
