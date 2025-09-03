import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const EsewaFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [failureReason, setFailureReason] = useState('Payment was not completed');

  useEffect(() => {
    // Get failure reason from various sources
    const urlReason = searchParams.get('reason');
    const stateReason = location.state?.error;
    const statusParam = searchParams.get('status');

    let reason = 'Payment was not completed';
    
    if (urlReason) {
      reason = urlReason;
    } else if (stateReason) {
      reason = stateReason;
    } else if (statusParam) {
      switch (statusParam.toLowerCase()) {
        case 'canceled':
        case 'cancelled':
          reason = 'Payment was canceled by user';
          break;
        case 'expired':
          reason = 'Payment session expired';
          break;
        case 'failed':
          reason = 'Payment processing failed';
          break;
        case 'pending':
          reason = 'Payment is still pending';
          break;
        default:
          reason = `Payment failed with status: ${statusParam}`;
      }
    }

    setFailureReason(reason);
    toast.error(`eSewa Payment Failed: ${reason}`);
  }, [searchParams, location.state]);

  const handleRetryPayment = () => {
    navigate('/checkout', { 
      state: { 
        retryPayment: true,
        previousMethod: 'eSewa'
      }
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">eSewa Payment Failed</h1>
        <p className="text-gray-600 mb-6">{failureReason}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div className="text-left">
              <h3 className="text-sm font-medium text-yellow-800">What happened?</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your eSewa payment could not be completed. This might be due to:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                <li>Payment was canceled</li>
                <li>Insufficient balance</li>
                <li>Network connectivity issues</li>
                <li>Session timeout</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Try Payment Again
          </button>
          
          <button
            onClick={handleViewCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
            View Cart
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance with your payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailed;
