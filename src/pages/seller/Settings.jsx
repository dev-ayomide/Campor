import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { updateSellerInfo } from '../../services/authService';
import { bankResolutionService } from '../../services/bankResolutionService';
import { CatalogueCoverUpload } from '../../components/common';

export default function SellerSettingsPage({ toggleMobileMenu }) {
  const { user, updateSellerData } = useAuth();
  const [activeTab, setActiveTab] = useState('store-info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [banksList, setBanksList] = useState([]);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [accountResolutionError, setAccountResolutionError] = useState(null);
  const [accountVerified, setAccountVerified] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // Store Info Form Data
  const [storeInfo, setStoreInfo] = useState({
    catalogueCover: '',
    catalogueName: '',
    storeDescription: '',
    phoneNumber: '',
    whatsappNumber: '',
    location: ''
  });

  // Payment Info Form Data
  const [paymentInfo, setPaymentInfo] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    if (user?.seller) {
      // Update form state with the latest data from context
      const newStoreInfo = {
        catalogueCover: user.seller.catalogueCover || '',
        catalogueName: user.seller.catalogueName || '',
        storeDescription: user.seller.storeDescription || '',
        phoneNumber: user.seller.phoneNumber || '',
        whatsappNumber: user.seller.whatsappNumber || '',
        location: user.seller.location || ''
      };

      const newPaymentInfo = {
        bankName: user.seller.bankName || '',
        bankCode: user.seller.bankCode || '',
        accountNumber: user.seller.accountNumber || '',
        accountName: user.seller.accountName || ''
      };

      // Always update the form state to ensure it reflects the latest data
      setStoreInfo(newStoreInfo);
      setPaymentInfo(newPaymentInfo);
      
      // Set account as verified if we already have account name
      if (newPaymentInfo.accountName && newPaymentInfo.accountNumber && newPaymentInfo.bankCode) {
        setAccountVerified(true);
      }
      
      console.log('🔄 Settings: Updated form state with latest seller data:', {
        catalogueCover: user.seller.catalogueCover,
        phoneNumber: user.seller.phoneNumber,
        whatsappNumber: user.seller.whatsappNumber
      });
    }
  }, [user?.seller]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isBankDropdownOpen && !event.target.closest('[data-bank-dropdown]')) {
        setIsBankDropdownOpen(false);
        setBankSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBankDropdownOpen]);

  // Filter banks based on search term
  const filteredBanks = banksList.filter(bank => 
    bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  // Fetch banks list on component mount
  useEffect(() => {
    const fetchBanksList = async () => {
      try {
        const response = await bankResolutionService.getBanksList();
        setBanksList(response.data || []);
        console.log('✅ Settings: Banks list fetched successfully');
      } catch (error) {
        console.error('❌ Settings: Failed to fetch banks list:', error);
        setError('Failed to load banks list. Please refresh the page.');
      }
    };

    fetchBanksList();
  }, []);

  // Clear success/error messages after a delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'bankName') {
      // Find the bank code when bank name is selected
      const selectedBank = banksList.find(bank => bank.name === value);
      setPaymentInfo(prev => ({
        ...prev,
        bankName: value,
        bankCode: selectedBank ? selectedBank.code : '',
        accountName: '', // Clear account name when bank changes
        accountNumber: '' // Clear account number when bank changes
      }));
      setAccountVerified(false);
      setAccountResolutionError(null);
    } else {
      setPaymentInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCoverChange = (coverUrl) => {
    setStoreInfo(prev => ({
      ...prev,
      catalogueCover: coverUrl
    }));
  };

  // Debounced account resolution function
  const debouncedResolveAccount = useCallback(async (accountNumber, bankCode) => {
    if (!bankCode || !accountNumber || accountNumber.length !== 10) {
      return;
    }

    setResolvingAccount(true);
    setAccountResolutionError(null);
    setAccountVerified(false);

    try {
      const response = await bankResolutionService.resolveAccount(
        accountNumber,
        bankCode
      );

      if (response.data && response.data.account_name) {
        setPaymentInfo(prev => ({
          ...prev,
          accountName: response.data.account_name
        }));
        setAccountVerified(true);
        setSuccess('Account name resolved successfully!');
        console.log('✅ Account resolved:', response.data);
      }
    } catch (error) {
      setAccountResolutionError(error.message);
      setAccountVerified(false);
      console.error('❌ Account resolution failed:', error);
    } finally {
      setResolvingAccount(false);
    }
  }, []);

  // Handle account number change with debouncing
  const handleAccountNumberChange = useCallback((e) => {
    const accountNumber = e.target.value.replace(/\D/g, ''); // Only allow digits
    
    setPaymentInfo(prev => ({
      ...prev,
      accountNumber,
      accountName: '' // Clear account name when number changes
    }));
    
    setAccountVerified(false);
    setAccountResolutionError(null);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced resolution
    if (accountNumber.length === 10 && paymentInfo.bankCode) {
      debounceTimeoutRef.current = setTimeout(() => {
        debouncedResolveAccount(accountNumber, paymentInfo.bankCode);
      }, 1000); // 1 second delay
    }
  }, [paymentInfo.bankCode, debouncedResolveAccount]);

  // Handle account number blur
  const handleAccountNumberBlur = useCallback(() => {
    if (paymentInfo.accountNumber.length === 10 && paymentInfo.bankCode && !accountVerified && !isManualEntry) {
      // Clear any existing timeout and resolve immediately
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debouncedResolveAccount(paymentInfo.accountNumber, paymentInfo.bankCode);
    }
  }, [paymentInfo.accountNumber, paymentInfo.bankCode, accountVerified, isManualEntry, debouncedResolveAccount]);

  // Handle manual entry toggle
  const handleManualEntryToggle = useCallback(() => {
    setIsManualEntry(!isManualEntry);
    if (!isManualEntry) {
      // Switching to manual entry - clear verification status
      setAccountVerified(false);
      setAccountResolutionError(null);
      setPaymentInfo(prev => ({ ...prev, accountName: '' }));
    } else {
      // Switching back to auto-verification - try to verify if we have valid details
      if (paymentInfo.accountNumber.length === 10 && paymentInfo.bankCode) {
        debouncedResolveAccount(paymentInfo.accountNumber, paymentInfo.bankCode);
      }
    }
  }, [isManualEntry, paymentInfo.accountNumber, paymentInfo.bankCode, debouncedResolveAccount]);

  // Handle manual account name change
  const handleManualAccountNameChange = useCallback((e) => {
    setPaymentInfo(prev => ({ ...prev, accountName: e.target.value }));
    if (e.target.value.trim()) {
      setAccountVerified(true);
      setAccountResolutionError(null);
    } else {
      setAccountVerified(false);
    }
  }, []);

  const handleStoreInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.seller?.id) {
        throw new Error('Seller information not found');
      }

      // Prepare seller data object (only basic seller info, not bank details)
      const sellerData = {
        catalogueName: storeInfo.catalogueName,
        storeDescription: storeInfo.storeDescription,
        phoneNumber: storeInfo.phoneNumber,
        whatsappNumber: storeInfo.whatsappNumber,
        location: storeInfo.location,
        catalogueCover: storeInfo.catalogueCover
      };

      await updateSellerInfo(user.seller.id, sellerData);
      setSuccess('Store information updated successfully!');
      
      // Update seller data in context with latest information
      try {
        await updateSellerData(user.seller.id);
        console.log('✅ Seller data updated in context');
        
        // Keep the form state with the updated values to prevent clearing
        // The form state already has the correct values from the user input
        console.log('✅ Form state preserved with updated values');
      } catch (contextError) {
        console.log('ℹ️ Context update failed, but data was saved to backend');
      }
      
      console.log('✅ Store info updated successfully');
      console.log('⚠️ Note: If changes don\'t appear in Dashboard, this is a backend issue');
    } catch (err) {
      console.error('❌ Failed to update store info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.seller?.id) {
        throw new Error('Seller information not found');
      }

      // Prepare bank details object for the separate bank details endpoint
      const bankDetails = {
        bankName: paymentInfo.bankName,
        bankCode: paymentInfo.bankCode,
        accountNumber: paymentInfo.accountNumber,
        accountName: paymentInfo.accountName
      };

      await bankResolutionService.updateSellerBankDetails(user.seller.id, bankDetails);
      setSuccess('Bank details updated successfully!');
      
      // Update seller data in context with latest information
      try {
        await updateSellerData(user.seller.id);
        console.log('✅ Seller data updated in context');
        
        // Keep the form state with the updated values to prevent clearing
        // The form state already has the correct values from the user input
        console.log('✅ Form state preserved with updated values');
      } catch (contextError) {
        console.log('ℹ️ Context update failed, but data was saved to backend');
      }
      
      console.log('✅ Payment info updated successfully');
      console.log('⚠️ Note: If changes don\'t appear in Dashboard, this is a backend issue');
    } catch (err) {
      console.error('❌ Failed to update payment info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto overflow-hidden">
        {/* Descriptive Text */}
        <p className="text-gray-600 mb-6">Manage your store configuration and preferences.</p>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('store-info')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'store-info'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Store Info
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Payments
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Success!</p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error:</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Store Info Tab */}
        {activeTab === 'store-info' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Information</h2>
            
            <form onSubmit={handleStoreInfoSubmit} className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <CatalogueCoverUpload
                  coverUrl={storeInfo.catalogueCover}
                  onCoverChange={handleCoverChange}
                  className="w-full"
                />
              </div>

              {/* Catalogue Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catalogue Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="catalogueName"
                    value={storeInfo.catalogueName}
                    onChange={handleStoreInfoChange}
                    placeholder="e.g Chidi's Phone Accessories"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                <textarea
                  name="storeDescription"
                  value={storeInfo.storeDescription}
                  onChange={handleStoreInfoChange}
                  placeholder="Tell Buyers About your store and what you sell"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={storeInfo.phoneNumber}
                      onChange={handleStoreInfoChange}
                      placeholder="eg. 09012345678"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={storeInfo.whatsappNumber}
                      onChange={handleStoreInfoChange}
                      placeholder="eg. 09012345678"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={storeInfo.location}
                      onChange={handleStoreInfoChange}
                      placeholder="eg. Block D"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    loading 
                      ? 'bg-blue-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Store Information'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>
            
            <form onSubmit={handlePaymentInfoSubmit} className="space-y-6">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <div className="relative" data-bank-dropdown style={{ zIndex: isBankDropdownOpen ? 50 : 40 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsBankDropdownOpen(!isBankDropdownOpen);
                      if (!isBankDropdownOpen) {
                        setBankSearchTerm('');
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="truncate">
                        {paymentInfo.bankName || 'Select Bank'}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 transition-transform flex-shrink-0 ml-2 ${isBankDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPaymentInfo(prev => ({
                                  ...prev,
                                  bankName: bank.name,
                                  bankCode: bank.code
                                }));
                                setIsBankDropdownOpen(false);
                                setBankSearchTerm('');
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                                paymentInfo.bankName === bank.name ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {bank.name}
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

              {/* Bank Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Code</label>
                <div className="relative">
                  <input
                    type="text"
                    name="bankCode"
                    value={paymentInfo.bankCode}
                    readOnly
                    placeholder="Auto-filled when bank is selected"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-1">Automatically set when you select a bank</p>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="accountNumber"
                    value={paymentInfo.accountNumber}
                    onChange={handleAccountNumberChange}
                    onBlur={handleAccountNumberBlur}
                    placeholder="9012345678"
                    maxLength="10"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      accountVerified ? 'border-green-300 bg-green-50' : 
                      accountResolutionError ? 'border-red-300 bg-red-50' : 
                      'border-gray-300'
                    }`}
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {resolvingAccount && (
                    <svg className="animate-spin w-5 h-5 text-blue-500 absolute right-4 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {accountVerified && !resolvingAccount && (
                    <svg className="w-5 h-5 text-green-500 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                {/* Account Resolution Status */}
                {accountResolutionError && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {accountResolutionError}
                  </div>
                )}
                {accountVerified && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                    ✓ Account name resolved successfully
                  </div>
                )}
                {paymentInfo.accountNumber.length === 10 && !accountVerified && !resolvingAccount && !accountResolutionError && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    Account will be verified automatically when you finish typing or click outside the field
                  </div>
                )}
              </div>

              {/* Account Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Account Name *
                    {paymentInfo.accountName && (
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        ✓ {isManualEntry ? 'Entered' : 'Verified'}
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={handleManualEntryToggle}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {isManualEntry ? 'Switch to Auto' : 'Enter Manually'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="accountName"
                    value={paymentInfo.accountName}
                    onChange={isManualEntry ? handleManualAccountNameChange : undefined}
                    readOnly={!isManualEntry}
                    placeholder={isManualEntry ? "Enter account holder name" : "Account holder name (auto-filled after verification)"}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg transition-colors ${
                      isManualEntry 
                        ? 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                        : paymentInfo.accountName 
                          ? 'bg-gray-50 border-green-300 text-gray-600' 
                          : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`}
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {paymentInfo.accountName && (
                    <svg className="w-5 h-5 text-green-500 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isManualEntry ? 'You can manually enter the account holder name' : 'This field is automatically filled after account verification'}
                </p>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Your bank details are encrypted and secure. They will only be used for payment settlements.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || (!accountVerified && !isManualEntry)}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    loading || (!accountVerified && !isManualEntry)
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : !accountVerified ? (
                    'Verify Account to Continue'
                  ) : (
                    'Update Payment Information'
                  )}
                </button>
                {!accountVerified && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Please verify your account details before updating payment information
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
