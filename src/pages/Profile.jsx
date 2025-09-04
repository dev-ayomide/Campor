import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCurrentUser, updateProfile } from '../services/authService';
import { getUserOrders } from '../services/ordersService';
import profileImage from '../assets/images/profile.png';
import productImage from '../assets/images/product.png';

export default function ProfilePage() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Profile: Fetching user profile...');
        const userData = await getCurrentUser();
        console.log('✅ Profile: User profile fetched:', userData);
        
        // Update account data with real user data
        setAccountData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Profile: Failed to fetch user profile:', err);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
        
        // If token is invalid, redirect to login
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          logout();
          navigate('/auth');
        }
      }
    };

    fetchUserProfile();
  }, [token, navigate, logout]);

  // Fetch user orders when Orders tab active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab !== 'Orders') return;
      if (!token) return;
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const data = await getUserOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setOrdersError(e.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, token]);

  // Mock wishlist data
  const wishlistItems = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 'N15,000.00',
      color: 'Black',
      image: productImage
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 'N25,000.00',
      color: 'Silver',
      image: productImage
    }
  ];

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Profile: Updating profile...');
      await updateProfile(accountData);
      
      console.log('✅ Profile: Profile updated successfully');
      // You could show a success message here
      
    } catch (err) {
      console.error('❌ Profile: Failed to update profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (id) => {
    // Mock function - would integrate with backend later
    console.log('Removing item from wishlist:', id);
  };

  const addToCart = (id) => {
    // Mock function - would integrate with backend later
    console.log('Adding item to cart:', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User Profile'}
                </h1>
                <p className="text-gray-600">{user?.email || accountData.email}</p>
                <p className="text-sm text-gray-500">
                  Role: {user?.role || 'Customer'} | 
                  Seller Status: {user?.sellerCompleted ? 'Completed' : 'Not Completed'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {['Orders', 'Wishlist', 'Account'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {/* Orders Tab */}
              {activeTab === 'Orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Orders</h2>
                  
                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    {ordersLoading ? (
                      <div className="flex items-center gap-2 text-gray-600 p-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-transparent"></div>
                        <span>Loading orders...</span>
                      </div>
                    ) : ordersError ? (
                      <div className="p-6 text-red-600">{ordersError}</div>
                    ) : orders.length === 0 ? (
                      <div className="p-6 text-gray-600">No orders yet.</div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 text-sm font-medium text-gray-600">Order Code</th>
                            <th className="text-left py-4 text-sm font-medium text-gray-600">Date</th>
                            <th className="text-left py-4 text-sm font-medium text-gray-600">Status</th>
                            <th className="text-left py-4 text-sm font-medium text-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-100 align-top">
                              <td className="py-6">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{order.orderCode || order.id}</span>
                                  {order.settlementCode && (
                                    <span className="text-xs text-gray-500">Settlement: {order.settlementCode}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-6 text-gray-600">{new Date(order.createdAt).toLocaleString()}</td>
                              <td className="py-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.orderStatus === 'DELIVERED'
                                    ? 'bg-green-100 text-green-800'
                                    : order.orderStatus === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="py-6">
                                <span className="font-medium text-gray-900">₦{Number(order.totalPrice || 0).toLocaleString()}</span>
                                {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {order.orderItems.map((item) => (
                                      <div key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                                        <img src={item.product?.imageUrls?.[0] || productImage} alt={item.product?.name} className="w-10 h-10 object-cover rounded" />
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">{item.product?.name}</div>
                                          <div className="text-xs text-gray-500">Qty: {item.quantity} × ₦{Number(item.price || 0).toLocaleString()}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'Wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Wishlist</h2>
                  
                  {/* Wishlist Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Product</th>
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Price</th>
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wishlistItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-6">
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => removeFromWishlist(item.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                                />
                                <div>
                                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                                  <p className="text-sm text-gray-500">Color: {item.color}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6">
                              <span className="font-medium text-gray-900">{item.price}</span>
                            </td>
                            <td className="py-6">
                              <button 
                                onClick={() => addToCart(item.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Add to cart
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'Account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Details</h2>
                  
                  <form onSubmit={handleAccountSubmit} className="space-y-6">
                    {/* Account Details Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          value={accountData.firstName}
                          onChange={(e) => setAccountData({...accountData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="First name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          value={accountData.lastName}
                          onChange={(e) => setAccountData({...accountData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Last name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DISPLAY NAME
                        </label>
                        <input
                          type="text"
                          value={accountData.displayName}
                          onChange={(e) => setAccountData({...accountData, displayName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Display name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          value={accountData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          placeholder="Email"
                        />
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Password</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            OLD PASSWORD
                          </label>
                          <input
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Old password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NEW PASSWORD
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="New password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            REPEAT NEW PASSWORD
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Repeat new password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                          loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {loading ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

