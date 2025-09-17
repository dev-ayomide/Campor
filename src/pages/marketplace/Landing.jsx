import { Link } from 'react-router-dom';
import { useState } from 'react';
import heroImage from '../../assets/images/heroimage.png';
import facilitateImage from '../../assets/images/image-fac.png';

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I verify my student account?",
      answer: "Simply sign up using your official RUN email address (@run.edu.ng). Our system automatically verifies your student status through your institutional email, ensuring only verified students can access the platform."
    },
    {
      question: "Is Campor safe for transactions?",
      answer: "Yes! Campor is designed with student safety in mind. All users are verified students, and we provide secure in-app payment options. You can also chat directly with sellers before making any transactions to build trust."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple secure payment methods including debit/credit cards, bank transfers, and mobile money options. All payments are processed securely within the app to protect your financial information."
    },
    {
      question: "How do I start selling on Campor?",
      answer: "After creating your account, simply click 'Sell' to complete our quick seller onboarding process. You'll be able to upload photos, set prices, and manage your listings through our easy-to-use seller dashboard."
    },
    {
      question: "What can I buy and sell on Campor?",
      answer: "You can buy and sell textbooks, electronics, clothing, personal items, services, and more. We encourage student entrepreneurship while maintaining a safe, campus-focused marketplace. Prohibited items include illegal goods and non-student services."
    },
    {
      question: "How do I meet up with buyers or sellers?",
      answer: "Once you've agreed on a purchase, you can arrange to meet on campus at convenient locations like the library, student center, or other safe campus areas. Our chat feature helps coordinate pickup times and locations."
    },
    {
      question: "What if I have a problem with a transaction?",
      answer: "Our support team is here to help! You can report issues through the app, and we'll work to resolve disputes between students. Since everyone is verified, we can easily connect with both parties to find fair solutions."
    }
  ];

  return (
    <div className="min-h-screen font-montserrat">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Your Campus<br />
              Marketplace.<br />
              Simplified.
            </h1>
            <p className="text-gray-500 text-base sm:text-lg md:text-xl mb-8 max-w-xl font-medium">
              Buy, sell, or trade with fellow students anytime, anywhere. Built for students. Backed by trust.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-row gap-2 mb-8">
              <Link
                to="/auth"
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 border-2 border-transparent"
                style={{ minWidth: '0', minHeight: '0' }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 85 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="85" height="60" rx="8" fill="#2563eb"/>
                  <path d="M34 15L54 30L34 45" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Account
              </Link>
              <Link
                to="/marketplace"
                className="flex items-center justify-center bg-white border-2 border-gray-900 hover:border-gray-700 text-gray-900 rounded-full font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                style={{ minWidth: '0', minHeight: '0' }}
              >
                Explore Listings
              </Link>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-gray-700 text-[1rem]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Verified student-only community</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Built for student entrepreneurs</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Affordable products and services</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Peer-to-peer trust and security</span>
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
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            App Features That Make <br/> Buying & Selling Easy
          </h2>
          
          <div className="flex justify-center">
            <picture>
              <source srcSet="/app-features-mobile.svg" media="(max-width: 640px)" />
              <img
                src="/app-features.svg"
                alt="App features illustration"
                className="w-full h-auto mx-auto"
              />
            </picture>
          </div>

         
        </div>
      </section>

      {/* How Campor Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Right Content (Text) - comes first on mobile */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                How Campor<br />Works
              </h2>
              
              <ol className="list-decimal list-inside text-gray-500 text-lg space-y-2 mb-8 pl-1">
                <li>
                  Create an account with your RUN email.
                </li>
                <li>
                  Post your product or service, or browse student listings.
                </li>
                <li>
                  Chat directly and close secure deals—no middlemen.
                </li>
              </ol>

              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">100% student verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">No scams or external sellers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">Trusted, on-campus network</span>
                </div>
              </div>
            </div>

            {/* Left Content (Image) - comes second on mobile */}
            <div className="order-2 lg:order-1">
              <img
                src="/Campor-works.svg"
                alt="How Campor Works illustration"
                className="w-full h-full mb-8 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className=" py-16 lg:py-24">
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
            <div className="flex items-center justify-center">
              <img
                src="/discover.svg"
                alt="Discover the campus marketplace"
                className="w-full max-w-md h-auto"
              />
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
   
            </div>

            {/* Right Content - Facilitate Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative z-10">
                <img 
                  src="/facilitate.svg" 
                  alt="Campus commerce illustration with phones and geometric shapes" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          openFAQ === index ? 'rotate-45' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
