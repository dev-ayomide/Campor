import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import heroImage from '../../assets/images/heroimage.png';
import facilitateImage from '../../assets/images/image-fac.png';

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const discoverRef = useRef(null);
  const coreFeaturesRef = useRef(null);
  const facilitateRef = useRef(null);
  const faqRef = useRef(null);
  
  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const discoverInView = useInView(discoverRef, { once: true, margin: "-100px" });
  const coreFeaturesInView = useInView(coreFeaturesRef, { once: true, margin: "-100px" });
  const facilitateInView = useInView(facilitateRef, { once: true, margin: "-100px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" });

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
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
    <div className="min-h-screen font-montserrat overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="text-left"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInLeft}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Campus<br />
              Marketplace.<br />
              <span className="text-blue-600">Verified & Secure.</span>
            </motion.h1>
            <motion.p 
              className="text-gray-500 text-base sm:text-lg md:text-xl mb-6 max-w-xl font-medium"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Buy, sell, or trade with verified RUN students. Only @run.edu.ng emails accepted. Secure transactions guaranteed.
            </motion.p>
            
            {/* Social Proof */}
            <motion.div 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="font-medium">Verified RUN Students Only</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="font-medium">Secure Payments</span>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-2 mb-8"
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/auth"
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm sm:text-base px-6 sm:px-6 py-3 sm:py-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 border-2 border-transparent w-full"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Join Campor
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/marketplace"
                  className="flex items-center justify-center bg-white border-2 border-gray-900 hover:border-gray-700 text-gray-900 rounded-full font-bold text-sm sm:text-base px-6 sm:px-6 py-3 sm:py-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 w-full"
                >
                  Browse Campus Items
                </Link>
              </motion.div>
            </motion.div>

            {/* Features List */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-gray-700 text-[1rem]"
              variants={staggerContainer}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div 
                className="flex items-center gap-2"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Verified student-only community</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Built for student entrepreneurs</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Affordable products and services</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Peer-to-peer trust and security</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div 
            className="relative"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInRight}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div 
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={heroImage} 
                alt="Student using laptop for campus marketplace" 
                className="w-full h-auto rounded-2xl shadow-2xl"
                loading="eager"
                decoding="async"
                style={{ imageRendering: 'auto' }}
              />
            </motion.div>
            {/* Decorative Elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-16 h-16 bg-blue-600 rounded-lg transform rotate-12"
              animate={{ 
                rotate: [12, 15, 12],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>
            <motion.div 
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-400 rounded-lg transform -rotate-12"
              animate={{ 
                rotate: [-12, -15, -12],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            ></motion.div>
            <motion.div 
              className="absolute top-1/2 -right-8 w-8 h-8 bg-gray-900 rounded-lg transform rotate-45"
              animate={{ 
                rotate: [45, 50, 45],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            ></motion.div>
            <motion.div 
              className="absolute bottom-1/4 -left-8 w-6 h-6 bg-blue-300 rounded transform rotate-45"
              animate={{ 
                rotate: [45, 50, 45],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            ></motion.div>
          </motion.div>
        </div>
      </section>

      {/* App Features Section */}
      <section ref={featuresRef} id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
            >
              Built Specifically for RUN Students
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto"
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Every feature designed with RUN campus life in mind. Verified students, secure payments, and campus-focused categories.
            </motion.p>
          
          <motion.div 
            className="flex justify-center"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <picture>
              <source srcSet="/app-features-mobile.svg" media="(max-width: 640px)" />
              <img
                src="/app-features.svg"
                alt="App features illustration"
                className="w-full h-auto mx-auto"
                loading="lazy"
                decoding="async"
                style={{ imageRendering: 'auto' }}
              />
            </picture>
          </motion.div>

         
        </div>
      </section>

      {/* How Campor Works */}
      <section ref={howItWorksRef} id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Right Content (Text) - comes first on mobile */}
            <motion.div 
              className="order-1 lg:order-2"
              initial="hidden"
              animate={howItWorksInView ? "visible" : "hidden"}
              variants={fadeInRight}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                How Campor<br />Works for RUN
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 text-lg mb-8"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Simple steps to join the RUN campus marketplace
              </motion.p>
              
              <motion.ol 
                className="list-decimal list-inside text-gray-700 text-lg space-y-3 mb-8 pl-1"
                variants={fadeInUp}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <li className="font-medium">
                  Sign up with your @run.edu.ng email for instant verification
                </li>
                <li className="font-medium">
                  List textbooks, electronics, or services. Browse campus-specific categories
                </li>
                <li className="font-medium">
                  Chat with verified students and complete secure transactions
                </li>
              </motion.ol>

              <motion.div 
                className="space-y-4 mt-6"
                variants={staggerContainer}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-center gap-3"
                  variants={fadeInUp}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">100% student verification</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  variants={fadeInUp}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">No scams or external sellers</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  variants={fadeInUp}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-6 h-6 bg-white border-2 border-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-8" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">Trusted, on-campus network</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Left Content (Image) - comes second on mobile */}
            <motion.div 
              className="order-2 lg:order-1"
              initial="hidden"
              animate={howItWorksInView ? "visible" : "hidden"}
              variants={fadeInLeft}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.img
                src="/Campor-works.svg"
                alt="How Campor Works illustration"
                className="w-full h-full mb-8 object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                loading="lazy"
                decoding="async"
                style={{ imageRendering: 'auto' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className=" py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
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
                loading="lazy"
                decoding="async"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section ref={coreFeaturesRef} id="core-features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4"
            initial="hidden"
            animate={coreFeaturesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
          >
            Why RUN Students Choose Campor
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg text-center mb-16 max-w-3xl mx-auto"
            initial="hidden"
            animate={coreFeaturesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Built exclusively for RUN campus community with features that matter to students
          </motion.p>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={coreFeaturesInView ? "visible" : "hidden"}
            variants={staggerContainer}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Verified Campus Community */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">RUN-Only Verification</h3>
              <p className="text-gray-600">
                Only @run.edu.ng emails accepted. Every user is a verified RUN student, eliminating scams and external sellers.
              </p>
            </motion.div>

            {/* Seamless Listing Tools */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Campus-Focused Categories</h3>
              <p className="text-gray-600">
                Textbooks, electronics, clothing, services - all organized for RUN campus life. Find exactly what you need from fellow students.
              </p>
            </motion.div>

            {/* Smart Search & Categories */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Campus Payments</h3>
              <p className="text-gray-600">
                Built-in payment system with multiple options. All transactions are secure and protected within the platform.
              </p>
            </motion.div>

            {/* Secure In-App Payments */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
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
            </motion.div>

            {/* Seller Dashboard & Stats */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
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
            </motion.div>

            {/* Direct Peer Messaging */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Peer Messaging</h3>
              <p className="text-gray-600">
                Connect directly with buyers and sellers through our built-in messaging system to negotiate and coordinate safely.
              </p>
            </motion.div>
          </motion.div>
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
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 lg:py-24 ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by RUN Students
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join the secure campus marketplace designed exclusively for RUN community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verification</h3>
              <p className="text-gray-600">Only @run.edu.ng emails accepted. Every user is a verified RUN student.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Built-in payment system with multiple secure options for safe transactions.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8"
                  fill="none"
                  stroke="#9333ea"
                  viewBox="0 0 24 24"
                  loading="lazy"
                  decoding="async"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Communication</h3>
              <p className="text-gray-600">Chat directly with buyers and sellers to negotiate and coordinate safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section ref={faqRef} id="faq" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-16"
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate={faqInView ? "visible" : "hidden"}
              variants={staggerContainer}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  variants={fadeInUp}
                  transition={{ duration: 0.6 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <motion.button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <motion.div 
                      className="flex-shrink-0"
                      animate={{ rotate: openFAQ === index ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
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
                    </motion.div>
                  </motion.button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === index ? "auto" : 0,
                      opacity: openFAQ === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
