import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../contexts/CartContext';
import { handlePaymentSuccess } from '../services/paymentService';
import { clearCartCache } from '../services/cartService';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearUserCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get payment reference from URL params
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentRef = reference || trxref;

        if (!paymentRef) {
          throw new Error('Payment reference not found in URL');
        }


        // Verify payment with backend (which calls Paystack API)
        const verificationResult = await handlePaymentSuccess(paymentRef);
        
        if (verificationResult.data?.status !== 'success') {
          throw new Error('Payment verification failed');
        }

        setPaymentVerified(true);
        setPaymentData(verificationResult.data);

        // Clear cart after successful payment verification
        // Backend webhook will handle order creation and inventory deduction
        await clearUserCart();
        clearCartCache();


      } catch (err) {
        setError(err.message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams, user, clearUserCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Cart
            </button>
            <Link
              to="/marketplace"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>

        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Reference:</span> {paymentData.reference}</p>
              <p><span className="font-medium">Amount:</span> ₦{(paymentData.amount / 100).toLocaleString()}</p>
              <p><span className="font-medium">Status:</span> {paymentData.status}</p>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Your order is being processed. You'll receive an email confirmation shortly with your order details and settlement code.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Orders
          </button>
          <Link
            to="/marketplace"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Your cart has been cleared and your order is being processed.</p>
          <p>Sellers will be notified.</p>
        </div>
      </div>
    </div>
  );
}
