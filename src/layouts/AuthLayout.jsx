
const authImage = '/authimage.png';

export default function AuthLayout({ children, heroImage }) {
  const imageToUse = heroImage || authImage;
  
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Left: Fixed image with overlay and glassmorphism */}
      <div className="hidden lg:flex w-1/2 h-full relative">
        <img
          src={imageToUse}
          alt="Student using laptop for campus marketplace"
          className="w-full h-full object-cover object-center"
        />
        {/* Decorative shapes */}
        <div className="absolute top-8 left-8 w-8 h-8 bg-blue-600 rounded-lg shadow-lg rotate-12"></div>
        <div className="absolute bottom-16 left-24 w-6 h-6 bg-blue-400 rounded-lg shadow-md -rotate-12"></div>
        <div className="absolute top-1/2 right-8 w-8 h-8 bg-gray-900 rounded-lg shadow-md rotate-45"></div>
        {/* Glassmorphism overlay */}
        <div className="absolute bottom-0 left-0 w-full px-8 pb-8">
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl text-white">
            <h1 className="text-2xl font-bold mb-2 drop-shadow">The Marketplace for RUN Students</h1>
            <p className="text-base leading-relaxed mb-2 drop-shadow">
              Discover a trusted space built for Redeemers University students to buy, sell, and trade with ease. Every account is verified through RUN email, ensuring real peers, real deals, and zero outside noise.
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span>Log in or sign up with your</span>
              <span className="font-semibold text-blue-200">RUN email</span>
              <span>to enter.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clean background with centered content */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="w-full max-w-xl px-8 flex flex-col items-center justify-center">
          {children}
        </div>
        {/* Decorative waves bottom right */}
        <div className="absolute bottom-8 right-8 opacity-10">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="text-gray-400">
            <path d="M0 20C20 20 20 0 40 0C60 0 60 20 80 20" stroke="currentColor" strokeWidth="2"/>
            <path d="M0 30C20 30 20 10 40 10C60 10 60 30 80 30" stroke="currentColor" strokeWidth="2"/>
            <path d="M0 40C20 40 20 20 40 20C60 20 60 40 80 40" stroke="currentColor" strokeWidth="2"/>
            <path d="M0 50C20 50 20 30 40 30C60 30 60 50 80 50" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
