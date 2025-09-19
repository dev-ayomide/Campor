import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrderBySettlementCode, initiateTransferToSeller } from '../../services/authService';
import { formatPrice } from '../../utils/formatting';

export default function AcceptOrder({ isOpen, onClose }) {
  const { user } = useAuth();
  const [settlementCode, setSettlementCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [transferData, setTransferData] = useState(null);

  const handleGetOrderDetails = async () => {
    if (!settlementCode.trim()) {
      setError('Please enter a settlement code');
      return;
    }

    if (!user?.seller?.id) {
      setError('Seller ID not found. Please make sure you are logged in as a seller.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setOrderData(null);

      const order = await getOrderBySettlementCode(user.seller.id, settlementCode);
      
      setOrderData(order);
      setSuccess('Order details retrieved successfully');

    } catch (err) {
      console.error('❌ AcceptOrder: Failed to get order details:', err);
      setError(err.message || 'Failed to retrieve order details');
    } finally {
      setLoading(false);
    }
  };


  const handleReceivePayment = async () => {
    if (!orderData?.orderSellers?.[0]?.id) {
      setError('Order seller ID not found');
      return;
    }

    try {
      setTransferLoading(true);
      setError('');
      setSuccess('');

      console.log('🔍 AcceptOrder: Initiating transfer for order seller:', orderData.orderSellers[0].id);
      const transfer = await initiateTransferToSeller(orderData.orderSellers[0].id);
      
      setTransferData(transfer);
      setSuccess('Transfer initiated successfully! Your payment is being processed.');
      console.log('✅ AcceptOrder: Transfer initiated:', transfer);

    } catch (err) {
      console.error('❌ AcceptOrder: Failed to initiate transfer:', err);
      setError(err.message || 'Failed to initiate transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCancel = () => {
    setSettlementCode('');
    setOrderData(null);
    setTransferData(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const handleClose = () => {
    handleCancel();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCodeExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Order</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Settlement Code Input */}
          {!orderData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Completion Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ask the buyer for their settlement code to retrieve order details and complete the transaction.
                </p>
                <input
                  type="text"
                  id="settlementCode"
                  value={settlementCode}
                  onChange={(e) => setSettlementCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter settlement code (e.g., 334382)"
                  disabled={loading}
                />
              </div>

              {/* How it works info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <p className="text-sm text-blue-800">
                  The buyer receives a unique settlement code when they pay. Enter this code to retrieve order details and process the payment transfer.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGetOrderDetails}
                  disabled={loading || !settlementCode.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Getting Order...
                    </>
                  ) : (
                    'Get Order Details'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Order Details */}
          {orderData && !transferData && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Order Code:</span>
                    <span className="ml-2 text-gray-900">{orderData.orderCode}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Settlement Code:</span>
                    <span className="ml-2 text-gray-900">{orderData.settlementCode}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Price:</span>
                    <span className="ml-2 text-gray-900 font-semibold">{formatPrice(orderData.totalPrice)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Order Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(orderData.createdAt)}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Expires At:</span>
                    <span className={`ml-2 ${isCodeExpired(orderData.settlementCodeExpiresAt) ? 'text-red-600' : 'text-green-600'}`}>
                      {formatDate(orderData.settlementCodeExpiresAt)}
                      {isCodeExpired(orderData.settlementCodeExpiresAt) && ' (EXPIRED)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                
                {orderData.orderSellers?.[0]?.order?.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.product.price)}</p>
                      <p className="text-sm text-gray-600">Total: {formatPrice(parseFloat(item.product.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReceivePayment}
                  disabled={transferLoading || isCodeExpired(orderData.settlementCodeExpiresAt)}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {transferLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Initiating Transfer...
                    </>
                  ) : (
                    'Receive Payment'
                  )}
                </button>
              </div>

              {isCodeExpired(orderData.settlementCodeExpiresAt) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        This settlement code has expired. You cannot receive payment for this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Success */}
          {transferData && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Transfer Initiated Successfully!</h3>
                <p className="text-green-700 mb-4">
                  Your transfer is being processed. You should expect to receive a credit alert within a few seconds to a couple of minutes.
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><span className="font-medium">Transfer Reference:</span> {transferData.data.reference}</div>
                    <div><span className="font-medium">Amount:</span> {formatPrice(transferData.data.amount / 100)}</div>
                    <div><span className="font-medium">Status:</span> {transferData.data.status}</div>
                  </div>
                </div>
                <p className="text-sm text-green-600">
                  If you have any issues, please contact our support at{' '}
                  <a href="mailto:support@campor.live" className="underline">support@campor.live</a>
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && !transferData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
