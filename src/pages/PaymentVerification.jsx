import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../contexts/CartContext';
import { verifyPayment } from '../services/paymentService';
import { clearCartCache } from '../services/cartService';
import { CheckCircle, XCircle, AlertCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function PaymentVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { clearUserCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'

  useEffect(() => {
    const verifyPaymentCallback = async () => {
      try {
        setLoading(true);
        setError(null);
        setVerificationStatus('verifying');

        // Get payment reference from URL params (Paystack callback format)
        const reference = searchParams.get('reference');
        
        if (!reference) {
          throw new Error('Payment reference not found in URL');
        }

        console.log('🔍 PaymentVerification: Verifying payment with reference:', reference);

        // Call backend verification API
        const verificationResult = await verifyPayment(reference);
        
        if (verificationResult.message === 'Payment verification successful' && verificationResult.data?.status === 'success') {
          setVerificationStatus('success');
          setPaymentData(verificationResult.data);
          
          // Clear cart after successful payment verification (only if user is authenticated)
          // Backend webhook will handle order creation and inventory deduction
          if (user) {
            try {
              await clearUserCart();
              clearCartCache();
            } catch (cartError) {
              console.warn('Failed to clear cart (user may not be authenticated):', cartError);
              // Don't fail the entire verification if cart clearing fails
            }
          }
          
          console.log('✅ PaymentVerification: Payment verified successfully');
        } else {
          setVerificationStatus('failed');
          setError('Payment verification failed. Please contact support if you were charged.');
        }

      } catch (err) {
        console.error('❌ PaymentVerification: Error verifying payment:', err);
        setVerificationStatus('failed');
        setError(err.message || 'Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentCallback();
  }, [searchParams, clearUserCart, user]);

  // Loading state - Payment verification in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto">
              <div className="w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Verifying Payment</h2>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your payment with our payment processor...
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm text-blue-700 mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Payment verification failed
  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-red-800 mb-1">What to do next:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Check your email for payment confirmation</li>
                  <li>• Contact support if you were charged</li>
                  <li>• Try the payment process again</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </button>
            <Link
              to="/marketplace"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>Need help? Contact our support team for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Payment verified successfully
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center p-8">
        <div className="relative">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-green-200 rounded-full animate-ping"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been verified and your order is being processed.
        </p>

        {/* Payment Details */}
        {paymentData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Payment Confirmed</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium text-gray-900 font-mono">{paymentData.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">₦{(paymentData.amount / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium text-gray-900">{paymentData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">{paymentData.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-900 font-mono">{paymentData.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• Your order is being processed by our team</li>
                <li>• Sellers will be notified of your purchase</li>
                <li>• Inventory will be updated automatically</li>
                <li>• You'll get settlement codes for pickup</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {user ? (
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View My Orders
            </button>
          ) : (
            <Link
              to="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Log In to View Orders
            </Link>
          )}
          <Link
            to="/marketplace"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-xs text-gray-500 space-y-1">
          {user ? (
            <>
              <p>Your cart has been cleared and your order is being processed.</p>
              <p>Thank you for shopping with Campor!</p>
            </>
          ) : (
            <>
              <p>Your order is being processed. Please log in to view your order history.</p>
              <p>Thank you for shopping with Campor!</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
