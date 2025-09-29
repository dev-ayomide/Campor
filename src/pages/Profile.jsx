import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import { getUserOrders } from '../services/ordersService';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';
import { addToCart, getCart } from '../services/cartService';
import { ProfileSkeleton } from '../components/common';
import { Eye } from 'lucide-react';
const profileImage = '/profile.png';
const productImage = '/product.png';

export default function ProfilePage() {
  const { user, token, logout, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  
  const [accountData, setAccountData] = useState({
    name: '',
    email: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          name: userData.name || '',
          email: userData.email || ''
        });
        
        // Set profile picture preview if available
        if (userData.profilePicture) {
          setProfilePicturePreview(userData.profilePicture);
        }
        // Mark profile as loaded and clear any prior error
        setProfileLoaded(true);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('❌ Profile: Failed to fetch user profile:', err);
        setError('Failed to load profile data. Please try again.');
        setProfileLoaded(false);
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

  // Fetch user wishlist when Wishlist tab is active
  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab !== 'Wishlist') return;
      if (!token) return;
      
      try {
        setWishlistLoading(true);
        setWishlistError(null);
        const data = await getWishlist();
        setWishlistItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setWishlistError(e.message || 'Failed to load wishlist');
        setWishlistItems([]);
      } finally {
        setWishlistLoading(false);
      }
    };
    fetchWishlist();
  }, [activeTab, token]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Profile: Updating profile...');
      
      const updateData = {
        name: accountData.name
      };
      
      if (profilePicture) {
        updateData.profilePicture = profilePicture;
      }
      
      const response = await updateUserProfile(updateData);
      
      console.log('✅ Profile: Profile updated successfully');
      console.log('🔍 Profile: Update response:', response);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update local state with the response data or fetch fresh data
      if (response.user) {
        // Use the user data from the response
        setAccountData({
          name: response.user.name || '',
          email: user?.email || accountData.email || ''
        });
        
        // Handle profile picture update
        if (profilePicture) {
          // We just uploaded a new picture, keep the local preview
          console.log('🔍 Profile: Keeping local preview for newly uploaded image');
        } else if (response.user.profilePicture) {
          // Update with the server URL for existing pictures
          setProfilePicturePreview(response.user.profilePicture);
          console.log('🔍 Profile: Updated profile picture from response:', response.user.profilePicture);
        }
      } else {
        // Fallback: fetch updated user data
        const updatedUserData = await getCurrentUser();
        console.log('🔍 Profile: Fetched updated user data:', updatedUserData);
        
        setAccountData({
          name: updatedUserData.name || '',
          email: updatedUserData.email || ''
        });
        
        if (updatedUserData.profilePicture) {
          setProfilePicturePreview(updatedUserData.profilePicture);
        }
      }
      
      // Clear the file input
      setProfilePicture(null);
      
    } catch (err) {
      console.error('❌ Profile: Failed to update profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      try {
        setUploadingImage(true);
        // Compress the image to reduce file size
        const compressedFile = await compressImage(file);
        console.log('🔍 Original file size:', file.size, 'Compressed size:', compressedFile.size);
        
        setProfilePicture(compressedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePicturePreview(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
        
        // Clear any previous errors
        setError(null);
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('Failed to process image. Please try a different file.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      // Refresh wishlist
      const data = await getWishlist();
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setWishlistError(error.message || 'Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      // Get current cart first
      const cart = await getCart();
      const cartId = cart.id;
      
      // Add item to cart
      await addToCart(cartId, [{
        productId: productId,
        quantity: 1
      }]);
      
      // Remove from wishlist after adding to cart
      await removeFromWishlist(productId);
      
      // Refresh wishlist
      const data = await getWishlist();
      setWishlistItems(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setWishlistError(error.message || 'Failed to add item to cart');
    }
  };

  const handleViewOrderDetails = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHIPPED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading && !profileLoaded) {
    return <ProfileSkeleton />;
  }

  if (error && !profileLoaded) {
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8">
              <div className="relative">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => document.getElementById('profilePictureInput').click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title={profilePicturePreview ? "Change profile picture" : "Add profile picture"}
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {accountData.name || user?.name || 'User Profile'}
                </h1>
                {(user?.role || user?.isSeller) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.isSeller ? 'Seller' : user?.role || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                {['Orders', 'Wishlist', 'Account'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div>
              {/* Orders Tab */}
              {activeTab === 'Orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Orders</h2>
                  
                  {/* Orders */}
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
                    <div>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Order Code</th>
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Date</th>
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Status</th>
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Total</th>
                              <th className="text-center py-4 text-sm font-medium text-gray-600">Actions</th>
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
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
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
                                <td className="py-6 text-center">
                                  <button
                                    onClick={() => handleViewOrderDetails(order)}
                                    className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View order details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-gray-900">{order.orderCode || order.id}</h3>
                                {order.settlementCode && (
                                  <p className="text-xs text-gray-500">Settlement: {order.settlementCode}</p>
                                )}
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                            
                            <div className="font-medium text-gray-900 mb-3">
                              Total: ₦{Number(order.totalPrice || 0).toLocaleString()}
                            </div>
                            
                            {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Items:</h4>
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
                            
                            {/* View Details Button */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Full Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'Wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Wishlist</h2>
                  
                  {/* Wishlist */}
                  {wishlistLoading ? (
                    <div className="flex items-center gap-2 text-gray-600 p-6">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-transparent"></div>
                      <span>Loading wishlist...</span>
                    </div>
                  ) : wishlistError ? (
                    <div className="p-6 text-red-600">{wishlistError}</div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="p-6 text-gray-600">No items in your wishlist yet.</div>
                  ) : (
                    <div>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Product</th>
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Price</th>
                              <th className="text-left py-4 text-sm font-medium text-gray-600">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {wishlistItems.map((item) => {
                              const product = item.product || item;
                              const productId = product.id || item.productId;
                              return (
                                <tr key={item.id || productId} className="border-b border-gray-100">
                                  <td className="py-6">
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => handleRemoveFromWishlist(productId)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                      <img 
                                        src={product.imageUrls?.[0] || productImage} 
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                                      />
                                      <div>
                                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6">
                                    <span className="font-medium text-gray-900">₦{Number(product.price || 0).toLocaleString()}</span>
                                  </td>
                                  <td className="py-6">
                                    <button 
                                      onClick={() => handleAddToCart(productId)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      Add to cart
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {wishlistItems.map((item) => {
                          const product = item.product || item;
                          const productId = product.id || item.productId;
                          return (
                            <div key={item.id || productId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-4">
                                <img 
                                  src={product.imageUrls?.[0] || productImage} 
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                                  <div className="font-medium text-gray-900 mb-3">
                                    ₦{Number(product.price || 0).toLocaleString()}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleAddToCart(productId)}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      Add to cart
                                    </button>
                                    <button 
                                      onClick={() => handleRemoveFromWishlist(productId)}
                                      className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors border border-gray-300 rounded-lg"
                                      title="Remove from wishlist"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'Account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Details</h2>
                  
                  <form onSubmit={handleAccountSubmit} className="space-y-6">
                    {/* Account Details Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NAME
                        </label>
                        <input
                          type="text"
                          value={accountData.name}
                          onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your full name"
                          required
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
                      
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                          PROFILE PICTURE
                          </label>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="relative">
                              {profilePicturePreview ? (
                                <img 
                                  src={profilePicturePreview} 
                                  alt="Profile Preview" 
                                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                              {uploadingImage && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => document.getElementById('profilePictureInputAccount').click()}
                              className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              title="Change profile picture"
                            >
                              <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          <input
                              id="profilePictureInputAccount"
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              className="hidden"
                          />
                        </div>
                        <div>
                            <button
                              onClick={() => document.getElementById('profilePictureInputAccount').click()}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Choose new photo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                          loading || uploadingImage
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Saving...</span>
                          </div>
                        ) : uploadingImage ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Processing image...</span>
                          </div>
                        ) : (
                          'Save changes'
                        )}
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

