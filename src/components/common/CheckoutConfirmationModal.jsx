import React from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { formatPrice, calculatePaystackCharge } from '../../utils/constants';

export default function CheckoutConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cartTotal, 
  totalItems,
  isProcessing = false 
}) {
  if (!isOpen) return null;

  const paystackCharge = calculatePaystackCharge(cartTotal);
  const totalWithCharges = cartTotal + paystackCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Confirm Checkout</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Please review your order details and payment breakdown before proceeding to Paystack.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({totalItems})</span>
                  <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-blue-600">Campus pickup</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment processing fee</span>
                  <span className="font-medium text-gray-900">{formatPrice(paystackCharge)}</span>
                </div>
                
                <div className="border-t border-gray-300 pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(totalWithCharges)}</span>
                  </div>
                </div>
              </div>
            </div>


            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-full px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
