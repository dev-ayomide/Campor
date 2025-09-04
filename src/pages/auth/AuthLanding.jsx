import { Link } from 'react-router-dom';

export default function AuthLandingPage() {
  return (
    <div className="text-center w-full max-w-lg mx-auto px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How would you like to continue?</h2>
      <p className="text-gray-600 mb-8 sm:mb-12">Choose an option below to start using Campor.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
        {/* Sign In Option */}
        <Link to="/login" className="w-full max-w-[280px] sm:max-w-[200px] sm:flex-1">
          <div className="p-6 border border-blue-300 bg-blue-50 rounded-2xl hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors transform rotate-45">
                <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign In</h3>
                <p className="text-sm text-gray-600 leading-tight">Access your account and pick up where you left off.</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Sign Up Option */}
        <Link to="/register" className="w-full max-w-[280px] sm:max-w-[200px] sm:flex-1">
          <div className="p-6 border border-gray-200 bg-white rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors transform rotate-45">
                <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-sm text-gray-600 leading-tight">Create a new account to start buying and selling.</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
