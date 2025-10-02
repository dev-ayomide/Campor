import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToNewsletter } from '../../services/newsletterService';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { isSeller } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSuccessMessage('');
    setErrorMessage('');
    try {
      setIsSubmitting(true);
      await subscribeToNewsletter(email.trim());
      setSuccessMessage('Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-black text-white py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top section - Newsletter title and email form */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 md:mb-16 space-y-8 lg:space-y-0">
          {/* Left side - Newsletter title */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Subscribe to Our<br />
              Newsletter
            </h2>
          </div>

          {/* Right side - Email form */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end">
            <form onSubmit={handleSubmit} className="flex bg-white rounded-full p-2 shadow-lg w-full max-w-md lg:max-w-none lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full lg:w-72 pl-12 pr-4 py-3 bg-transparent text-gray-900 placeholder-gray-500 rounded-full focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 rounded-full font-medium transition-colors whitespace-nowrap ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Subscribing...' : 'Get Started'}
              </button>
            </form>
          </div>
          {(successMessage || errorMessage) && (
            <div className="mt-4 w-full lg:w-auto text-center lg:text-right">
              {successMessage && (
                <p className="text-green-400 text-sm" role="status">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-400 text-sm" role="alert">{errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Want to sell section - only show for non-sellers */}
        {!isSeller && (
          <div className="text-center mb-12">
            <p className="text-gray-300 text-lg mb-4">
              Want to sell?{' '}
              <Link 
                to="/seller/onboarding" 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline"
              >
                Become a seller today
              </Link>
            </p>
          </div>
        )}

        {/* Bottom section - Company branding centered */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Campor</h3>
          <p className="text-gray-300 mb-4">Your Campus Marketplace. Simplified.</p>
          
          {/* Legal Links */}
          <div className="flex justify-center space-x-6 mb-4">
            <Link 
              to="/terms" 
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline"
            >
              Contact Support
            </Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            Copyright © {new Date().getFullYear()} Campor
          </p>
          <p className="text-gray-500 text-sm">
            All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
