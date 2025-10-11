import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChatListSkeleton } from '../common';
import { socketService } from '../../services/socketService';
import { findExistingChat, checkChatExists } from '../../utils/chatUtils';

const ChatList = ({ onConversationSelect, selectedConversationId }) => {
  const { conversations, loadConversations, searchConversations, loading } = useChat();
  const { isSeller, user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allConversations, setAllConversations] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'chats', 'orders'
  const searchTimeoutRef = useRef(null);

  // Improved algorithm to check existing chats and handle message button clicks
  const handleMessageSeller = async (orderSeller) => {
    const sellerUserId = orderSeller.seller.userId;
    const sellerCatalogueName = orderSeller.seller.catalogueName;
    
    
    try {
      // Step 1: Check loaded conversations first (fast)
      const existingChat = findExistingChat(conversations, sellerUserId);
      
      if (existingChat) {
        // Navigate to existing chat - show seller's actual name (like "Daniel")
        onConversationSelect(existingChat.id);
        return;
      }
      
      // Step 2: Check API for existing chat (comprehensive)
      const existingChatId = await checkChatExists(sellerUserId);
      
      if (existingChatId) {
        // Navigate to existing chat from API
        onConversationSelect(existingChatId);
        return;
      }
      
      // Step 3: No existing chat found, start new chat
      // Start new chat - pass seller info in structured format: seller-userId::catalogueName
      onConversationSelect(`seller-${sellerUserId}::${sellerCatalogueName}`);
      
    } catch (error) {
      // Fallback: start new chat if there's any error
      onConversationSelect(`seller-${sellerUserId}::${sellerCatalogueName}`);
    }
  };

  // Store all conversations when they're first loaded
  useEffect(() => {
    if (conversations.length > 0 && searchQuery === '') {
      setAllConversations(conversations);
    }
  }, [conversations, searchQuery]);

  // Filter conversations based on active filter
  const getFilteredConversations = () => {
    if (activeFilter === 'all') {
      return conversations;
    } else if (activeFilter === 'chats') {
      return conversations.filter(conv => conv.type !== 'order');
    } else if (activeFilter === 'orders') {
      return conversations.filter(conv => conv.type === 'order');
    }
    return conversations;
  };

  const filteredConversations = getFilteredConversations();

  // Listen for conversation creation events
  useEffect(() => {
    const handleConversationCreated = () => {

      loadConversations();
    };

    window.addEventListener('conversationCreated', handleConversationCreated);
    
    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated);
    };
  }, [loadConversations]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.connected);
    };
    
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 2000);
    
    return () => {
      clearInterval(connectionInterval);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async (query) => {

    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        if (query.trim()) {

          await searchConversations(query);
        } else {

          // If search is empty, reload all conversations
          await loadConversations();
        }
      } catch (error) {

      }
    }, 300);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // No loading spinner - seamless like demo


  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-5 border-b border-gray-200" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Connecting...'}</span>
            {!isConnected && (
              <button
                onClick={async () => {
                  const token = localStorage.getItem('campor_token');
                  try {
                    await socketService.reconnect(token);

                  } catch (error) {

                  }
                }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search...."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors text-gray-700 placeholder-gray-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('chats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'chats'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveFilter('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Conversations List - Scrollable */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {loading ? (
          <div className="p-3">
            <ChatListSkeleton />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {filteredConversations.map((conversation) => (
              <div key={conversation.id}>
                {conversation.type === 'order' ? (
                  // Order-grouped conversation
                  <div className="mb-4">
                    <div 
                      className="bg-blue-600 text-white p-4 rounded-xl mb-2 cursor-pointer hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        const newExpanded = new Set(expandedOrders);
                        if (newExpanded.has(conversation.id)) {
                          newExpanded.delete(conversation.id);
                        } else {
                          newExpanded.add(conversation.id);
                        }
                        setExpandedOrders(newExpanded);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 6L9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15.6116 3H8.3886C6.43325 3 4.76449 4.41365 4.44303 6.3424L2.77636 16.3424C2.37001 18.7805 4.25018 21 6.72194 21H17.2783C19.75 21 21.6302 18.7805 21.2238 16.3424L19.5572 6.3424C19.2357 4.41365 17.5669 3 15.6116 3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{conversation.orderCode}</h3>
                          </div>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-white transition-transform duration-200 ${
                            expandedOrders.has(conversation.id) ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Sellers in this order - Only show when expanded */}
                    {expandedOrders.has(conversation.id) && (
                      <div className="space-y-0">
                      {conversation.orderSellers.map((orderSeller, index) => {
                        const isCurrentUser = orderSeller.seller.userId === currentUser?.id;
                        const sellerItems = conversation.orderItems.filter(item => 
                          item.sellerId === orderSeller.sellerId
                        );
                        
                        return (
                          <div key={orderSeller.id} className="bg-white">
                            {/* Seller Header */}
                            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {orderSeller.seller.catalogueName.charAt(0)}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{orderSeller.seller.catalogueName}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (isCurrentUser) {
                                    alert('You cannot message yourself. This is your own order.');
                                    return;
                                  }
                                  // Use the algorithm to check existing chats
                                  handleMessageSeller(orderSeller);
                                }}
                                disabled={isCurrentUser}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  isCurrentUser 
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                }`}
                              >
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 15.5C21 16.0304 20.7893 16.5391 20.4142 16.9142C20.0391 17.2893 19.5304 17.5 19 17.5H7L3 21.5V5.5C3 4.96957 3.21071 4.46086 3.58579 4.08579C3.96086 3.71071 4.46957 3.5 5 3.5H19C19.5304 3.5 20.0391 3.71071 20.4142 4.08579C20.7893 4.46086 21 4.96957 21 5.5V15.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                            
                            {/* Seller Items */}
                            <div className="space-y-2 p-3">
                              {sellerItems.map((item) => (
                                <div key={item.id} className="bg-white border border-black rounded-lg p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                      {item.productImages && item.productImages.length > 0 ? (
                                        <img 
                                          src={item.productImages[0]} 
                                          alt={item.productName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                                      <p className="text-sm text-gray-500">Qty: {item.quantity} x ₦{item.priceAtPurchase.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">₦{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Separator line between sellers */}
                            {index < conversation.orderSellers.length - 1 && (
                              <div className="border-t border-gray-200"></div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                ) : (
                  // Individual conversation
                  <div
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 border-blue-400 shadow-sm'
                    : 'bg-gray-50 border-blue-300 hover:bg-gray-100 hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {conversation.participant.initials}
                    </div>
                    {conversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Time */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {/* Message Preview and Unread Count */}
                    <div className="flex items-center justify-between">
                      {conversation.lastMessage && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 truncate flex-1 mr-2">
                          {/* Image icon for image messages */}
                          {conversation.lastMessage.imageUrl && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs">Photo</span>
                            </div>
                          )}
                          {/* Text content */}
                          {conversation.lastMessage.content && (
                            <span className="truncate">
                              {conversation.lastMessage.content}
                            </span>
                          )}
                          {/* Show "Photo" text if only image, no text */}
                          {conversation.lastMessage.imageUrl && !conversation.lastMessage.content && (
                            <span className="text-gray-500">Photo</span>
                          )}
                        </div>
                      )}
                      
                      {/* Unread Count Badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-medium px-1 flex-shrink-0">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;