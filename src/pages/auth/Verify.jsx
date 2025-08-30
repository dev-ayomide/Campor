import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

export default function VerifyAccountPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRefs = useRef([]);

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('campor_verification_email');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem('campor_verification_email', emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // No email found, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setMsg('');
    setLoading(true);
    
    try {
      const response = await authService.verifyEmail(email, verificationCode);
      
      // Email verification successful
      setMsg('Email verified successfully! Redirecting to login...');
      
      // Clear any stored verification email
      localStorage.removeItem('campor_verification_email');
      
      // Always redirect to login page after verification
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err) {
      setMsg(err.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await authService.resendVerificationCode(email);
    setMsg('Verification code has been resent to your email.');
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    } catch (err) {
      setMsg(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Verify Your Account</h1>
        <p className="text-gray-600">
          We sent a code to your email : <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 6-digit code input */}
        <div className="flex justify-center space-x-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => inputRefs.current[index] = el}
              type="text"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              maxLength="1"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        {msg && (
          <div className={`p-3 border rounded-lg ${msg.includes('failed') || msg.includes('check') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-sm text-center ${msg.includes('failed') || msg.includes('check') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            'Verifying...'
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Verify
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={handleResendCode}
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          disabled={loading}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
