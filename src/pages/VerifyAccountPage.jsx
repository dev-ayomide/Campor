import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyAccountPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

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
      // Mock verification for now
      setMsg('Verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setMsg('Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setMsg('Verification code has been resent to your email.');
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Verify Your Account</h1>
        <p className="text-gray-600">
          We sent a code to your email : <span className="font-medium">user.email@run.edu.ng</span>
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
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
