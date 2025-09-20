import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerSeller, testSellerEndpoint } from '../../services/authService';
import { bankResolutionService } from '../../services/bankResolutionService';

export default function SellerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { completeSellersOnboarding } = useAuth();

  // Form states for each step
  const [storeInfo, setStoreInfo] = useState({
    catalogueName: '',
    storeDescription: '',
    cataloguePicture: null
  });

  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    bankCode: ''
  });

  const [contactInfo, setContactInfo] = useState({
    location: '',
    phoneNumber: '',
    whatsappNumber: ''
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Bank verification states
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankVerificationError, setBankVerificationError] = useState(null);
  const [banksList, setBanksList] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [lastVerificationAttempt, setLastVerificationAttempt] = useState(0);
  const [accountVerified, setAccountVerified] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const steps = [
    { number: 1, title: 'Store Info', isCompleted: currentStep > 1 },
    { number: 2, title: 'Bank Details', isCompleted: currentStep > 2 },
    { number: 3, title: 'Contact Info', isCompleted: currentStep > 3 }
  ];

  // Fetch banks list on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const response = await bankResolutionService.getBanksList();
        setBanksList(response.data || []);
        console.log('✅ Banks list fetched successfully:', response.data?.length || 0, 'banks');
      } catch (error) {
        console.error('❌ Failed to fetch banks list:', error);
        setError('Failed to load banks list. Please refresh the page.');
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isBankDropdownOpen && !event.target.closest('[data-bank-dropdown]')) {
        setIsBankDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBankDropdownOpen]);

  // Debounced account resolution function
  const debouncedResolveAccount = useCallback(async (accountNumber, bankCode) => {
    if (!bankCode || !accountNumber || accountNumber.length !== 10) {
      return;
    }

    setIsVerifyingBank(true);
    setBankVerificationError(null);
    setAccountVerified(false);

    try {
      const response = await bankResolutionService.resolveAccount(
        accountNumber,
        bankCode
      );

      if (response.data && response.data.account_name) {
        setBankDetails(prev => ({
          ...prev,
          accountName: response.data.account_name,
          bankCode: bankCode
        }));
        setAccountVerified(true);
        setBankVerificationError(null);
        console.log('✅ Account resolved successfully:', response.data);
      } else {
        setBankDetails(prev => ({
          ...prev,
          accountName: ''
        }));
        setBankVerificationError('Account verification failed. Please check your details.');
        setAccountVerified(false);
      }
    } catch (error) {
      console.error('❌ Account resolution failed:', error);
      setBankDetails(prev => ({
        ...prev,
        accountName: ''
      }));
      setAccountVerified(false);
      
      // Provide specific guidance based on error type
      if (error.message.includes('Server error')) {
        setBankVerificationError(
          'Bank verification service is temporarily unavailable. You can continue with manual entry.'
        );
      } else if (error.message.includes('Rate limit')) {
        setBankVerificationError(
          'Too many verification attempts. Please wait before trying again.'
        );
      } else if (error.message.includes('Invalid account')) {
        setBankVerificationError(
          'Account number or bank code is invalid. Please check your details.'
        );
      } else {
        setBankVerificationError(error.message || 'Failed to verify account. Please try again.');
      }
    } finally {
      setIsVerifyingBank(false);
    }
  }, []);

  // Handle account number change with debouncing
  const handleAccountNumberChange = useCallback((e) => {
    const accountNumber = e.target.value.replace(/\D/g, ''); // Only allow digits
    
    setBankDetails(prev => ({
      ...prev,
      accountNumber,
      accountName: '' // Clear account name when number changes
    }));
    
    setAccountVerified(false);
    setBankVerificationError(null);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced resolution
    if (accountNumber.length === 10 && bankDetails.bankCode) {
      debounceTimeoutRef.current = setTimeout(() => {
        debouncedResolveAccount(accountNumber, bankDetails.bankCode);
      }, 1000); // 1 second delay
    }
  }, [bankDetails.bankCode, debouncedResolveAccount]);

  // Handle account number blur
  const handleAccountNumberBlur = useCallback(() => {
    if (bankDetails.accountNumber.length === 10 && bankDetails.bankCode && !accountVerified) {
      // Clear any existing timeout and resolve immediately
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debouncedResolveAccount(bankDetails.accountNumber, bankDetails.bankCode);
    }
  }, [bankDetails.accountNumber, bankDetails.bankCode, accountVerified, debouncedResolveAccount]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoreInfo(prev => ({ ...prev, cataloguePicture: file }));
    }
  };

  // Filter banks based on search term
  const filteredBanks = banksList.filter(bank => 
    bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  // Form validation functions
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return storeInfo.catalogueName.trim() && storeInfo.storeDescription.trim();
      case 2:
        return bankDetails.bankName && 
               bankDetails.accountNumber && 
               bankDetails.accountName && 
               bankDetails.accountNumber.length >= 10 &&
               accountVerified; // Require account verification
      case 3:
        return contactInfo.phoneNumber.trim() && contactInfo.location.trim();
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    return validateCurrentStep();
  };

  const handleNextStep = () => {
    if (!canProceedToNext()) {
      // Show validation error for current step
      let errorMessage = '';
      switch (currentStep) {
        case 1:
          errorMessage = 'Please complete all required fields: Store name and Store description';
          break;
        case 2:
          if (!bankDetails.bankName) {
            errorMessage = 'Please select a bank';
          } else if (!bankDetails.accountNumber) {
            errorMessage = 'Please enter your account number';
          } else if (bankDetails.accountNumber.length < 10) {
            errorMessage = 'Please enter a valid 10-digit account number';
          } else if (!bankDetails.accountName) {
            errorMessage = 'Please wait for account verification to complete';
          } else if (!accountVerified) {
            errorMessage = 'Please verify your account details before proceeding';
          }
          break;
        case 3:
          errorMessage = 'Please complete all required fields: Phone number and Location';
          break;
      }
      setError(errorMessage);
      return;
    }
    
    setError(null); // Clear any previous errors
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Testing seller endpoint connectivity...');
      const result = await testSellerEndpoint();
      
      if (result.success) {
        setError('✅ Connection test passed! Backend is accessible.');
      } else {
        setError(`❌ Connection test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setError(`❌ Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Store Info validation
    if (!storeInfo.catalogueName.trim()) {
      errors.push('Store name is required');
    }
    if (!storeInfo.storeDescription.trim()) {
      errors.push('Store description is required');
    }
    
    // Bank Details validation
    if (!bankDetails.bankName) {
      errors.push('Bank name is required');
    }
    if (!bankDetails.accountNumber.trim()) {
      errors.push('Account number is required');
    }
    if (!bankDetails.accountName.trim()) {
      errors.push('Account name is required');
    }
    
    // Contact Info validation
    if (!contactInfo.phoneNumber.trim()) {
      errors.push('Phone number is required');
    }
    if (!contactInfo.location.trim()) {
      errors.push('Location is required');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(`Please complete the following fields:\n• ${validationErrors.join('\n• ')}`);
      setIsLoading(false);
      return;
    }
    
    try {
      // Prepare basic seller data (store info + contact info)
      const basicSellerData = {
        catalogueName: storeInfo.catalogueName,
        storeDescription: storeInfo.storeDescription,
        cataloguePicture: storeInfo.cataloguePicture,
        phoneNumber: contactInfo.phoneNumber,
        whatsappNumber: contactInfo.whatsappNumber || contactInfo.phoneNumber, // Use phone number if WhatsApp is empty
        location: contactInfo.location
      };
      
      // Prepare bank details separately
      const bankDetailsData = {
        bankName: bankDetails.bankName,
        bankCode: bankDetails.bankCode,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName
      };
      
      console.log('Seller registration data:', { basicSellerData, bankDetailsData });
      
      // Call the API to register seller (basic info first)
      const response = await registerSeller(basicSellerData);
      console.log('Seller registration successful:', response);
      
      // Update bank details separately if seller was created successfully
      if (response.seller?.id) {
        try {
          await bankResolutionService.updateSellerBankDetails(response.seller.id, bankDetailsData);
          console.log('Bank details updated successfully');
        } catch (bankError) {
          console.error('Failed to update bank details:', bankError);
          // Don't fail the entire registration if bank details fail
        }
      }
      
      // Update user's seller status in context
      completeSellersOnboarding(response);
      
      // Navigate to seller dashboard
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Seller registration failed:', error);
      
      // Parse and format API error messages to be user-friendly
      let userFriendlyError = 'Registration failed. Please try again.';
      
      if (error.message) {
        // Check if it's a validation error with field names
        if (error.message.includes('"catalogueName"')) {
          userFriendlyError = 'Please enter your store name';
        } else if (error.message.includes('"storeDescription"')) {
          userFriendlyError = 'Please enter a store description';
        } else if (error.message.includes('"bankName"')) {
          userFriendlyError = 'Please select your bank';
        } else if (error.message.includes('"accountNumber"')) {
          userFriendlyError = 'Please enter your account number';
        } else if (error.message.includes('"accountName"')) {
          userFriendlyError = 'Please enter your account name';
        } else if (error.message.includes('"phoneNumber"')) {
          userFriendlyError = 'Please enter your phone number';
        } else if (error.message.includes('"location"')) {
          userFriendlyError = 'Please enter your location';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userFriendlyError = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Server error')) {
          userFriendlyError = 'Server is temporarily unavailable. Please try again in a few minutes.';
        } else {
          // For other errors, try to make them more user-friendly
          userFriendlyError = error.message.replace(/"/g, '').replace(/is not allowed to be empty/g, 'is required');
        }
      }
      
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catalogue
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={storeInfo.catalogueName}
                  onChange={(e) => setStoreInfo(prev => ({ ...prev, catalogueName: e.target.value }))}
                  placeholder="e.g Chidi's Phone Accessories"
                  className="w-full pl-12 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                value={storeInfo.storeDescription}
                onChange={(e) => setStoreInfo(prev => ({ ...prev, storeDescription: e.target.value }))}
                placeholder="Tell Buyers About your store and what you sell"
                rows="4"
                className="w-full p-4 bg-transparent border border-gray-300 rounded-xl focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="coverImage" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Click to upload cover image</p>
                    <p className="text-xs sm:text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </label>
                {storeInfo.cataloguePicture && (
                  <p className="mt-2 text-sm text-blue-600">
                    Selected: {storeInfo.cataloguePicture.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative" data-bank-dropdown style={{ zIndex: isBankDropdownOpen ? 50 : 40 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsBankDropdownOpen(!isBankDropdownOpen);
                    if (!isBankDropdownOpen) {
                      setBankSearchTerm('');
                    }
                  }}
                  disabled={isLoadingBanks}
                  className="w-full pl-12 pr-10 py-3 sm:py-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors text-left disabled:opacity-50 flex items-center justify-between hover:border-gray-400"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className={bankDetails.bankName ? 'text-gray-900' : 'text-gray-500'}>
                      {isLoadingBanks ? 'Loading banks...' : bankDetails.bankName || 'Select Bank'}
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isBankDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Bank Options Dropdown */}
                {isBankDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden z-50">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search banks..."
                          value={bankSearchTerm}
                          onChange={(e) => setBankSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Bank Options */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => {
                              setBankDetails(prev => ({ 
                                ...prev, 
                                bankName: bank.name,
                                bankCode: bank.code,
                                accountName: '', // Clear account name when bank changes
                                accountNumber: '' // Clear account number when bank changes
                              }));
                              setBankVerificationError(null);
                              setAccountVerified(false);
                              setIsBankDropdownOpen(false);
                              setBankSearchTerm('');
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
                          >
                            <span className="text-gray-900">{bank.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          No banks found matching "{bankSearchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
                {isVerifyingBank && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    Verifying...
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={handleAccountNumberChange}
                  onBlur={handleAccountNumberBlur}
                  placeholder="9077249922"
                  maxLength="10"
                  className={`w-full pl-12 pr-4 py-3 sm:py-4 bg-transparent border rounded-xl focus:border-blue-500 transition-colors ${
                    accountVerified ? 'border-green-300 bg-green-50' : 
                    bankVerificationError ? 'border-red-300 bg-red-50' : 
                    'border-gray-300'
                  }`}
                  required
                />
                {isVerifyingBank && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {accountVerified && !isVerifyingBank && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Account Resolution Status */}
              {bankVerificationError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                  {bankVerificationError}
                </div>
              )}
              {accountVerified && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                  ✓ Account name resolved successfully
                </div>
              )}
              {bankDetails.accountNumber.length === 10 && !accountVerified && !isVerifyingBank && !bankVerificationError && (
                <div className="mt-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  Account will be verified automatically when you finish typing or click outside the field
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name <span className="text-red-500">*</span>
                {bankDetails.accountName && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    ✓ Verified
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  readOnly
                  placeholder="Account name (auto-filled after verification)"
                  className={`w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50 border rounded-xl text-gray-600 ${
                    bankDetails.accountName 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {bankDetails.accountName && (
                <p className="mt-1 text-xs text-green-600">
                  Account name verified successfully
                </p>
              )}
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Note:</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your bank details are encrypted and secure. They will only be used for payment settlements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Fields - Stacked on mobile, grid on larger screens */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={contactInfo.phoneNumber}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="eg. 09012345678"
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={contactInfo.whatsappNumber}
                    onChange={(e) => setContactInfo(prev => ({ 
                      ...prev, 
                      whatsappNumber: e.target.value
                    }))}
                    placeholder="eg. 09012345678"
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={contactInfo.location}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="eg. RUN Campus, Ogun State"
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Note:</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Leave WhatsApp number empty if it is the same as phone number
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="flex items-center text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/sell" className="hover:text-blue-600">Sell</Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Become a Seller</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Become a seller</h2>
            <p className="text-gray-500 text-sm sm:text-base">Set up your seller profile to start selling on Campor</p>
          </div>

          {/* Progress Steps - Mobile Responsive */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                    step.number === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step.isCompleted
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.isCompleted ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                    step.number === currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${
                      step.isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4 sm:space-y-6">
            {renderStepContent()}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 sm:mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Please fix the following:</p>
                  <div className="text-sm text-red-700 mt-1 whitespace-pre-line">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={!canProceedToNext()}
                className={`w-full sm:flex-1 font-semibold py-3 px-6 rounded-xl transition-colors ${
                  canProceedToNext()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to {steps[currentStep].title}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !canProceedToNext()}
                className={`w-full sm:flex-1 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center ${
                  isLoading || !canProceedToNext()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Finish'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}