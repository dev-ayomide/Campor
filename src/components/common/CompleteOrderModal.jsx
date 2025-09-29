import { useState } from 'react';

export default function CompleteOrderModal({ isOpen, onClose, onSubmit }) {
  const [completionCode, setCompletionCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (completionCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(completionCode);
      setCompletionCode('');
      onClose();
    } catch (error) {
      alert('Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompletionCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Complete Order</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instruction */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Completion Code</h3>
              <p className="text-gray-600 text-sm">
                Ask the buyer for their 6-digit completion code to finalize the transaction
              </p>
            </div>

            {/* Input Field */}
            <div>
              <input
                type="text"
                value={completionCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCompletionCode(value);
                }}
                placeholder="Enter 6 digit code (e.g. 123456)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            {/* How it works */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
              <p className="text-sm text-blue-800">
                The buyer receives a unique code when they pay. Enter this code to confirm the transaction and release your payment.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || completionCode.length !== 6}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading || completionCode.length !== 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Completing...
                  </div>
                ) : (
                  'Complete Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
