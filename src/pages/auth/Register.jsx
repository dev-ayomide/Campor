import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { PasswordInput, Modal } from '../../components/common';
import { subscribeToNewsletter } from '../../services/newsletterService';
import TermsAndConditions from './TermsAndConditions';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localErr, setLocalErr] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr(null);

    if (fullName.length < 2) return setLocalErr('Full name must be at least 2 characters');
    if (!isValidEmail(email)) return setLocalErr('Use your RUN email (your.name@run.edu.ng)');
    if (!isValidPassword(password)) return setLocalErr('Password must be at least 6 characters');
    if (password !== confirm) return setLocalErr('Passwords do not match');
    if (!agreeToTerms) return setLocalErr('You must agree to the Terms and Conditions');

    try {
      await register({ name: fullName, email, password });
      
      // Subscribe to newsletter if user opted in
      if (subscribeToNewsletter) {
        try {
          await subscribeToNewsletter(email);
        } catch (newsletterErr) {
          // Don't fail registration if newsletter subscription fails
          console.log('Newsletter subscription failed:', newsletterErr);
        }
      }
      
      // Store email for verification
      localStorage.setItem('campor_verification_email', email);
      // after registration you might want to redirect to verify
      navigate('/verify');
    } catch (err) {
      setLocalErr(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Back button - circular, top right */}
      <div className="absolute -top-2 -right-2">
        <Link 
          to="/auth" 
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Join Campor and start buying, selling, or listing products within the campus community.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${
                localErr && fullName.length < 2 ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {localErr && fullName.length < 2 && (
            <p className="text-xs text-red-500 mt-1">Name must be at least 2 characters long</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@run.edu.ng"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Only @run.edu.ng emails are accepted</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required={true}
          />
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                localErr && !agreeToTerms ? 'border-red-300' : ''
              }`}
              required
            />
          </div>
          <div className="text-sm">
            <label htmlFor="agree-terms" className="text-gray-700 cursor-pointer">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Terms and Conditions
              </button>
            </label>
            {localErr && !agreeToTerms && (
              <p className="text-xs text-red-500 mt-1">You must agree to the terms to continue</p>
            )}
          </div>
        </div>

        {/* Newsletter Subscription Checkbox */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="subscribe-newsletter"
              type="checkbox"
              checked={subscribeToNewsletter}
              onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="subscribe-newsletter" className="text-gray-700 cursor-pointer">
              I'd love to receive updates about new features, campus events, and exclusive deals from Campor via email
            </label>
          </div>
        </div>

        {localErr && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{localErr}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
          disabled={loading || !agreeToTerms}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Sign Up
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>

      {/* Terms and Conditions Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms and Conditions"
        size="xl"
      >
        <TermsAndConditions />
      </Modal>
    </div>
  );
}
