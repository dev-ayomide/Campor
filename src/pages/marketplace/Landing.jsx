import { Link } from 'react-router-dom';
import heroImage from '../../assets/images/heroimage.png';
import facilitateImage from '../../assets/images/image-fac.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Campus Marketplace. Simplified.
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg">
              Buy, sell and trade with fellow students on-campus. 
              Connect with verified @run.edu.ng emails only.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                to="/auth" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/marketplace" 
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-center transition-colors"
              >
                Explore Listings
              </Link>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">100% student verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">No account or external sellers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">Secure and student-friendly</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="Student using laptop for campus marketplace" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-600 rounded-lg transform rotate-12"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-lg transform -rotate-12"></div>
            <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gray-900 rounded-lg transform rotate-45"></div>
            <div className="absolute bottom-1/4 -left-8 w-6 h-6 bg-blue-300 rounded transform rotate-45"></div>
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            App Features That Make Buying & Selling Easy
          </h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto mb-16"></div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Seamless Listings */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Seamless Listings</h3>
              <p className="text-gray-600">
                Create and manage your product listings with ease. Upload photos, set prices, and reach students instantly.
              </p>
            </div>

            {/* Secure Payments */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Safe and secure payment processing with multiple payment options for convenient transactions.
              </p>
            </div>

            {/* Smart Categories */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Categories</h3>
              <p className="text-gray-600">
                Organized categories make it easy to find exactly what you're looking for or list your items.
              </p>
            </div>
          </div>

          {/* Decorative Wave */}
          <div className="flex justify-end mt-16">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20"></div>
              <div className="absolute inset-2 bg-blue-500 rounded-full opacity-40"></div>
              <div className="absolute inset-4 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How Campor Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-2xl mb-8 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Right Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                How Campor Works
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create an account with your RUN email</h3>
                    <p className="text-gray-600">Sign up using your verified @run.edu.ng email address to join our exclusive campus community.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Post an ad to sell, or search to buy an item</h3>
                    <p className="text-gray-600">List your items for sale or browse through hundreds of student listings to find what you need.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Connect with verified RUN student buyers & sellers</h3>
                    <p className="text-gray-600">Chat directly with other students, negotiate prices, and arrange safe meetups on campus.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">100% student verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">No scammers or external sellers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Trusted, on-campus network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Discover every detail of the campus marketplace.
              </h2>
              
              <p className="text-gray-600 mb-8">
                At Campor, we've created a streamlined buying and selling experience that puts RUN students first. From textbooks to electronics, from clothes to services - find it all here.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Real-time updates on new listings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Verified sellers and products</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Streamlined buying and selling experience</span>
                </div>
              </div>
            </div>

            {/* Right Content - Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
              </div>
              <div className="col-span-2 bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <div className="w-24 h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-16">
            Campor's Core Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Verified Campus Community */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Campus Community</h3>
              <p className="text-gray-600">
                Access to verified @run.edu.ng student accounts ensuring a safe and trusted marketplace environment for all transactions.
              </p>
            </div>

            {/* Seamless Listing Tools */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Seamless Listing Tools</h3>
              <p className="text-gray-600">
                Easily add and manage your listings. Upload multiple photos, set competitive prices, and reach your fellow students instantly.
              </p>
            </div>

            {/* Smart Search & Categories */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Search & Categories</h3>
              <p className="text-gray-600">
                Quickly discover what you're looking for with intelligent search features and organized product categories.
              </p>
            </div>

            {/* Secure In-App Payments */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure In-App Payments</h3>
              <p className="text-gray-600">
                Complete safe transactions within the app using multiple secure payment methods including cards and mobile money.
              </p>
            </div>

            {/* Seller Dashboard & Stats */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">My Dashboard & Stats</h3>
              <p className="text-gray-600">
                Comprehensive seller tools to track your sales, manage inventory, view analytics, and grow your campus business.
              </p>
            </div>

            {/* Direct Peer Messaging */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Peer Messaging</h3>
              <p className="text-gray-600">
                Connect directly with buyers and sellers through our built-in messaging system to negotiate and coordinate safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilitate Convenient Campus Commerce Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
                  <div>
                    <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Facilitate<br />
                    Convenient Campus<br />
                    Commerce
                    </h2>
                    
                    <p className="text-gray-600 text-md mb-8 leading-relaxed">
                    Experience a platform that makes buying and selling on campus simple and secure.
                    </p>

                    <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      </div>
                      <span className="text-md">Transactions become easier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      </div>
                      <span className="text-md">Better access to campus goods and services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      </div>
                      <span className="text-md">Supporting student entrepreneurship</span>
                    </div>
                    </div>

                    {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300 leading-none">GET IT ON</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300 leading-none">Download on the</div>
                    <div className="text-sm font-semibold leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Content - Facilitate Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative z-10">
                <img 
                  src={facilitateImage} 
                  alt="Campus commerce illustration with phones and geometric shapes" 
                  className="w-full h-auto max-w-lg rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
