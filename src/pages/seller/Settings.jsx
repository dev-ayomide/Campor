import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { updateSellerInfo } from '../../services/authService';

export default function SellerSettingsPage({ toggleMobileMenu }) {
  const { user, updateSellerData } = useAuth();
  const [activeTab, setActiveTab] = useState('store-info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Store Info Form Data
  const [storeInfo, setStoreInfo] = useState({
    cataloguePicture: null,
    catalogueName: '',
    storeDescription: '',
    phoneNumber: '',
    whatsappNumber: '',
    location: ''
  });

  // Payment Info Form Data
  const [paymentInfo, setPaymentInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    if (user?.seller) {
      setStoreInfo({
        cataloguePicture: user.seller.cataloguePicture || null,
        catalogueName: user.seller.catalogueName || '',
        storeDescription: user.seller.storeDescription || '',
        phoneNumber: user.seller.phoneNumber || '',
        whatsappNumber: user.seller.whatsappNumber || '',
        location: user.seller.location || ''
      });

      setPaymentInfo({
        bankName: user.seller.bankName || '',
        accountNumber: user.seller.accountNumber || '',
        accountName: user.seller.accountName || ''
      });
    }
  }, [user]);

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
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoreInfo(prev => ({
        ...prev,
        cataloguePicture: file
      }));
    }
  };

  const handleStoreInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.seller?.id) {
        throw new Error('Seller information not found');
      }

      const formData = new FormData();
      formData.append('catalogueName', storeInfo.catalogueName);
      formData.append('storeDescription', storeInfo.storeDescription);
      formData.append('phoneNumber', storeInfo.phoneNumber);
      formData.append('whatsappNumber', storeInfo.whatsappNumber);
      formData.append('location', storeInfo.location);

      if (storeInfo.cataloguePicture) {
        formData.append('cataloguePicture', storeInfo.cataloguePicture);
      }

      await updateSellerInfo(user.seller.id, formData);
      setSuccess('Store information updated successfully!');
      
      // Update seller data in context with latest information
      try {
        await updateSellerData(user.seller.id);
        console.log('✅ Seller data updated in context');
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

      const formData = new FormData();
      formData.append('bankName', paymentInfo.bankName);
      formData.append('accountNumber', paymentInfo.accountNumber);
      formData.append('accountName', paymentInfo.accountName);

      await updateSellerInfo(user.seller.id, formData);
      setSuccess('Payment information updated successfully!');
      
      // Update seller data in context with latest information
      try {
        await updateSellerData(user.seller.id);
        console.log('✅ Seller data updated in context');
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
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/seller" className="hover:text-gray-700">Sell</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Settings</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Manage your store configuration and preferences
          </h1>
        </div>

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
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cover-image"
                  />
                  <label
                    htmlFor="cover-image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {storeInfo.cataloguePicture ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <img
                          src={typeof storeInfo.cataloguePicture === 'string' 
                            ? storeInfo.cataloguePicture 
                            : URL.createObjectURL(storeInfo.cataloguePicture)
                          }
                          alt="Cover preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500">Click to upload cover image PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
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
                <div className="relative">
                  <select
                    name="bankName"
                    value={paymentInfo.bankName}
                    onChange={handlePaymentInfoChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Citibank">Citibank</option>
                    <option value="Diamond Bank">Diamond Bank</option>
                    <option value="Ecobank">Ecobank</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="First City Monument Bank">First City Monument Bank</option>
                    <option value="Guaranty Trust Bank">Guaranty Trust Bank</option>
                    <option value="Heritage Bank">Heritage Bank</option>
                    <option value="Keystone Bank">Keystone Bank</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="Opay">Opay</option>
                    <option value="PalmPay">PalmPay</option>
                    <option value="Polaris Bank">Polaris Bank</option>
                    <option value="Providus Bank">Providus Bank</option>
                    <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                    <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                    <option value="Sterling Bank">Sterling Bank</option>
                    <option value="Union Bank">Union Bank</option>
                    <option value="United Bank For Africa">United Bank For Africa</option>
                    <option value="Unity Bank">Unity Bank</option>
                    <option value="VBank">VBank</option>
                    <option value="Wema Bank">Wema Bank</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                  </select>
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="accountNumber"
                    value={paymentInfo.accountNumber}
                    onChange={handlePaymentInfoChange}
                    placeholder="9077249922"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="accountName"
                    value={paymentInfo.accountName}
                    onChange={handlePaymentInfoChange}
                    placeholder="Jonny Sun"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Your bank details are encrypted and secure. They will only be used for payment settlements.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
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
                    'Update Payment Information'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
