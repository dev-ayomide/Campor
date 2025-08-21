import { useState } from 'react';
import { Link } from 'react-router-dom';
import productImage from '../assets/images/product.png';
import profileImage from '../assets/images/profile.png';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    // Fatima's Finds items
    {
      id: 1,
      sellerId: 1,
      sellerName: "Fatima's Finds",
      sellerAvatar: profileImage,
      productName: 'Evostik VR Headset Virtual Reality Adjustable 3D Glasses',
      price: 150000,
      quantity: 1,
      image: productImage
    },
    {
      id: 2,
      sellerId: 1,
      sellerName: "Fatima's Finds",
      sellerAvatar: profileImage,
      productName: 'Evostik VR Headset Virtual Reality Adjustable 3D Glasses',
      price: 150000,
      quantity: 1,
      image: productImage
    },
    // David Ventures items
    {
      id: 3,
      sellerId: 2,
      sellerName: "David Ventures",
      sellerAvatar: profileImage,
      productName: 'Evostik VR Headset Virtual Reality Adjustable 3D Glasses',
      price: 150000,
      quantity: 1,
      image: productImage
    },
    {
      id: 4,
      sellerId: 2,
      sellerName: "David Ventures",
      sellerAvatar: profileImage,
      productName: 'Evostik VR Headset Virtual Reality Adjustable 3D Glasses',
      price: 150000,
      quantity: 1,
      image: productImage
    }
  ]);

  // Group items by seller
  const groupedItems = cartItems.reduce((groups, item) => {
    const sellerId = item.sellerId;
    if (!groups[sellerId]) {
      groups[sellerId] = {
        seller: {
          id: sellerId,
          name: item.sellerName,
          avatar: item.sellerAvatar
        },
        items: []
      };
    }
    groups[sellerId].items.push(item);
    return groups;
  }, {});

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const getSellerTotal = (sellerItems) => {
    return sellerItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return `N${price.toLocaleString()}`;
  };

  const handleCheckoutSeller = (sellerId) => {
    const sellerItems = groupedItems[sellerId].items;
    const total = getSellerTotal(sellerItems);
    console.log(`Checkout for ${groupedItems[sellerId].seller.name}: ${formatPrice(total)}`);
  };

  const handleCheckoutAll = () => {
    console.log(`Checkout all items: ${formatPrice(getTotalAmount())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <span>›</span>
              <span className="text-gray-900">Shopping Cart</span>
            </div>
            <div className="text-sm text-gray-600">
              {getTotalItems()} Items
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(groupedItems).map((group) => (
              <div key={group.seller.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Seller Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={group.seller.avatar} 
                      alt={group.seller.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium text-gray-900">{group.seller.name}</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                </div>

                {/* Seller Items */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.productName}
                          </h3>
                          <p className="text-lg font-bold text-gray-900 mb-3">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              +
                            </button>
                            
                            {/* Remove Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seller Checkout */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => handleCheckoutSeller(group.seller.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    Checkout ({formatPrice(getSellerTotal(group.items))})
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="text-center py-6">
              <Link 
                to="/marketplace"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({getTotalItems()})</span>
                  <span className="font-medium text-gray-900">{formatPrice(getTotalAmount())}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-blue-600">Campus pickup</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(getTotalAmount())}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckoutAll}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-4"
              >
                Checkout All
              </button>

              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  <strong>Tip:</strong> You can checkout with each seller separately or message them directly from your cart.
                </p>
                <p>All payments are processed securely through Paystack.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
