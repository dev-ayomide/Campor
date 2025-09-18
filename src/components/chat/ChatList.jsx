import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ChatListSkeleton } from '../common';

const ChatList = ({ onConversationSelect, selectedConversationId }) => {
  const { conversations, loadConversations, searchConversations, loading } = useChat();
  const { isSeller } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');


  const handleSearch = async (query) => {
    console.log('🔍 ChatList: Search input changed to:', query);
    setSearchQuery(query);
    try {
      if (query.trim()) {
        console.log('🔍 ChatList: Calling searchConversations with:', query);
        await searchConversations(query);
      } else {
        console.log('🔍 ChatList: Empty query, reloading all conversations');
        // If search is empty, reload all conversations
        await loadConversations();
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
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
  console.log('🔍 ChatList: Current conversations:', conversations.length);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-5 border-b border-gray-200" style={{ backgroundColor: '#F7F5F0' }}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search...."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors text-gray-700 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Conversations List - Scrollable */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {loading ? (
          <div className="p-3">
            <ChatListSkeleton />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
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
                    {/* Name and Role */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        conversation.participant.role === 'Buyer' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {conversation.participant.role}
                      </span>
                    </div>
                    
                    {/* Message Preview */}
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {conversation.lastMessage.content}
                    </p>
                    
                    {/* Reply Context */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-blue-600 font-medium">
                        Re: {conversation.product.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
