import { useState } from 'react';
import { Link } from 'react-router-dom';
import profileImage from '../assets/images/profile.png';
import productImage from '../assets/images/product.png';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Orders');
  const [accountData, setAccountData] = useState({
    firstName: 'Sofia',
    lastName: 'Havertz',
    displayName: 'Sofia Havertz',
    email: 'sofia.havertz@example.com'
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock orders data
  const orders = [
    {
      id: '#3456_768',
      date: 'October 17, 2023',
      status: 'Pending',
      price: 'N1234.00'
    },
    {
      id: '#3456_980',
      date: 'October 11, 2023',
      status: 'Delivered',
      price: 'N345.00'
    },
    {
      id: '#3456_120',
      date: 'August 24, 2023',
      status: 'Delivered',
      price: 'N2345.00'
    },
    {
      id: '#3456_030',
      date: 'August 12, 2023',
      status: 'Delivered',
      price: 'N845.00'
    }
  ];

  // Mock wishlist data
  const wishlistItems = [
    {
      id: 1,
      name: 'VR Goggles',
      color: 'Black',
      price: 'N19.19',
      image: productImage
    },
    {
      id: 2,
      name: 'Speaker',
      color: 'Beige',
      price: 'N345',
      image: productImage
    },
    {
      id: 3,
      name: 'Iphone 13',
      color: 'Beige',
      price: 'N8.80',
      image: productImage
    },
    {
      id: 4,
      name: 'Macbook',
      color: 'Beige',
      price: 'N8.80',
      image: productImage
    }
  ];

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    console.log('Account updated:', accountData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    console.log('Password updated');
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const removeFromWishlist = (itemId) => {
    console.log('Remove item from wishlist:', itemId);
  };

  const addToCart = (itemId) => {
    console.log('Add item to cart:', itemId);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-gray-900">Profile</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">My Account</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Profile Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img 
                    src={profileImage} 
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-4">{accountData.displayName}</h2>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {[
                  { id: 'Account', label: 'Account', active: activeTab === 'Account' },
                  { id: 'Orders', label: 'Orders', active: activeTab === 'Orders' },
                  { id: 'Wishlist', label: 'Wishlist', active: activeTab === 'Wishlist' },
                  { id: 'LogOut', label: 'Log Out', active: false }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.id !== 'LogOut' ? setActiveTab(item.id) : console.log('Logout')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              
              {/* Orders Tab */}
              {activeTab === 'Orders' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders History</h2>
                    <p className="text-gray-600">Click on an order to view order details</p>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Number ID</th>
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Dates</th>
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-4 text-sm font-medium text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr 
                            key={order.id} 
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="py-4">
                              <span className="text-gray-900 font-medium">{order.id}</span>
                            </td>
                            <td className="py-4">
                              <span className="text-gray-600">{order.date}</span>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="text-gray-900 font-medium">{order.price}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center mt-8">
                    <nav className="flex items-center gap-2">
                      <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {[1, 2, 9, 10].map((page, index) => (
                        <div key={page} className="flex items-center">
                          <button
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              page === 1
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                          {index === 1 && <span className="px-2 text-gray-400">...</span>}
                        </div>
                      ))}
                      
                      <button className="px-3 py-2 text-gray-600 hover:text-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
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
                          FIRST NAME *
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
                          LAST NAME *
                        </label>
                        <input
                          type="text"
                          value={accountData.lastName}
                          onChange={(e) => setAccountData({...accountData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DISPLAY NAME *
                      </label>
                      <input
                        type="text"
                        value={accountData.displayName}
                        onChange={(e) => setAccountData({...accountData, displayName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Display name"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This will be how your name will be displayed in the account section and in reviews
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        EMAIL *
                      </label>
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email"
                      />
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
