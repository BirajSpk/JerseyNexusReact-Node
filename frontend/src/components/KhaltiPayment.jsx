import React, { useState, useEffect } from 'react';
import { CreditCard, Loader, CheckCircle, XCircle } from 'lucide-react';
import { paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';

const KhaltiPayment = ({ 
  orderId, 
  amount, 
  onSuccess, 
  onError, 
  onCancel,
  disabled = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, pending, success, error

  const initializePayment = async () => {
    if (!orderId || !amount) {
      toast.error('Order information is missing');
      return;
    }

    setIsLoading(true);
    setStatus('pending');

    try {
      const response = await paymentAPI.initiateKhalti({
        orderId,
        returnUrl: `${window.location.origin}/payment/callback`
      });

      const { payment_url, pidx } = response.data.data;
      
      if (payment_url) {
        setPaymentUrl(payment_url);
        
        // Open payment URL in a new window
        const paymentWindow = window.open(
          payment_url,
          'khalti-payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for payment completion
        const checkPaymentStatus = setInterval(async () => {
          try {
            if (paymentWindow.closed) {
              clearInterval(checkPaymentStatus);
              
              // Try to verify payment
              const verifyResponse = await paymentAPI.verifyKhalti({
                pidx,
                orderId
              });
              
              if (verifyResponse.data.success) {
                setStatus('success');
                onSuccess?.(verifyResponse.data.data);
                toast.success('Payment completed successfully!');
              } else {
                setStatus('error');
                onError?.('Payment verification failed');
                toast.error('Payment verification failed');
              }
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            if (paymentWindow.closed) {
              clearInterval(checkPaymentStatus);
              setStatus('error');
              onError?.(error.message);
              toast.error('Payment verification failed');
            }
          }
        }, 2000);

        // Cleanup after 10 minutes
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          if (!paymentWindow.closed) {
            paymentWindow.close();
          }
          if (status === 'pending') {
            setStatus('error');
            onError?.('Payment timeout');
            toast.error('Payment timeout. Please try again.');
          }
        }, 10 * 60 * 1000);
        
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setStatus('error');
      onError?.(error.message);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStatus('idle');
    setPaymentUrl(null);
    onCancel?.();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pay with Khalti</h3>
          <p className="text-sm text-gray-600">Secure payment gateway</p>
        </div>
      </div>

      {status === 'idle' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount to pay:</span>
              <span className="font-semibold text-lg text-gray-900">
                {formatAmount(amount)}
              </span>
            </div>
          </div>
          
          <button
            onClick={initializePayment}
            disabled={disabled || isLoading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay with Khalti
              </>
            )}
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div className="text-center py-6">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h4 className="font-semibold text-gray-900 mb-2">Payment in Progress</h4>
          <p className="text-gray-600 mb-4">
            Complete your payment in the opened window
          </p>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel Payment
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h4 className="font-semibold text-gray-900 mb-2">Payment Successful!</h4>
          <p className="text-gray-600">
            Your payment of {formatAmount(amount)} has been processed successfully.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-6">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h4 className="font-semibold text-gray-900 mb-2">Payment Failed</h4>
          <p className="text-gray-600 mb-4">
            There was an issue processing your payment. Please try again.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Secured by</span>
          <span className="font-semibold text-purple-600">Khalti</span>
        </div>
      </div>
    </div>
  );
};

export default KhaltiPayment;