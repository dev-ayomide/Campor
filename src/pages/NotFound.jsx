import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 "></div>
      
      {/* Content */}
      <div className="relative z-20 text-center px-8 max-w-2xl mx-auto">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Page not{' '}
          <span className="relative">
            found!
            {/* Text shadow effect under magnifying glass */}
            <span className="absolute inset-0 text-gray-900 blur-sm opacity-30"></span>
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
          We couldn't find what you are{' '}
          <span className="relative">
            looking for or the page no longer exists.
            {/* Text shadow effect under magnifying glass */}
            <span className="absolute inset-0 text-gray-600 blur-sm opacity-30"></span>
          </span>
        </p>
        
        {/* Go Home Button */}
        <Link 
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Go Home
        </Link>
      </div>

      {/* Magnifying Glass Image - Positioned to overlap text */}
      <div className="absolute top-1/2  md:right-1/4 right-16 transform -translate-y-1/2 rotate-12 z-10">
        <img 
          src="/magnifier.webp" 
          alt="Magnifying glass" 
          className="w-48 md:w-64 h-auto drop-shadow-lg object-contain"
        />
      </div>
    </div>
  );
}
