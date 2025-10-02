export default function ContactSupport() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're here to help! Get in touch with our support team for assistance with your account, orders, or any questions about Campor.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                <p className="text-gray-600 mb-2">Get help via email</p>
                <a href="mailto:support@campor.live" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
                  support@campor.live
                </a>
                <p className="text-sm text-gray-500 mt-1">We'll respond as soon as possible</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">What to include in your email:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your full name and email address</li>
                <li>• Brief description of the issue</li>
                <li>• Any relevant order numbers or screenshots</li>
                <li>• Steps you've already tried</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I verify my student status?</h3>
              <p className="text-gray-600">Use your Redeemer's University email address during registration. We'll send a verification email to confirm your student status.</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How does payment work?</h3>
              <p className="text-gray-600">Payments are held in escrow until you confirm delivery. Once you release the settlement code, the seller receives payment.</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I sell items as a buyer?</h3>
              <p className="text-gray-600">Yes! Complete the seller onboarding process to start listing items. You'll need to verify your student status first.</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What if I have a dispute?</h3>
              <p className="text-gray-600">Contact our support team immediately. We'll investigate and help resolve any issues with orders or payments.</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I reset my password?</h3>
              <p className="text-gray-600">Click "Forgot Password" on the login page and enter your email address. We'll send you a reset link.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
