import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../services/chatService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { socketService } from '../../services/socketService';
import { ChatMessageSkeleton, ChatIcon } from '../common';

// Add custom styles for mobile chat experience
const chatStyles = `
  .chat-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer and Edge */
  }
  
  .chat-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  @media (max-width: 1024px) {
    .chat-layout-mobile {
      height: 100vh !important;
      overflow: hidden !important;
    }
    
    .chat-layout-mobile .chat-fixed-header {
      position: fixed !important;
      top: 80px !important; /* Account for navbar */
      left: 0 !important;
      right: 0 !important;
      z-index: 40 !important;
      background-color: #F7F5F0 !important;
    }
    
    .chat-layout-mobile .chat-fixed-input {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 40 !important;
      background-color: #F7F5F0 !important;
    }
    
    .chat-layout-mobile .chat-messages-mobile {
      padding-top: 140px !important; /* Account for navbar + header */
      padding-bottom: 80px !important;
      height: 100vh !important;
      overflow-y: auto !important;
    }
    
    .chat-layout-mobile .chat-no-conv-mobile {
      padding-top: 140px !important; /* Account for navbar + header */
      padding-bottom: 80px !important;
      height: 100vh !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('chat-mobile-styles')) {
  const style = document.createElement('style');
  style.id = 'chat-mobile-styles';
  style.textContent = chatStyles;
  document.head.appendChild(style);
}

const ChatWindow = ({ conversationId, currentUser, onBackToList }) => {
  const { sendMessage, markAsRead, joinChatRoom, leaveChatRoom, startTyping, stopTyping, typingUsers, onlineUsers } = useChat();
  const { isSeller } = useAuth();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId');
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const loadConversation = async () => {
    try {
      const data = await chatService.getConversation(conversationId);
      setConversation(data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const data = await chatService.getMessages(conversationId);
      console.log('📋 Loaded messages from API:', data);
      setMessages(data);
      
      // Mark messages as read
      markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId, markAsRead]);

  useEffect(() => {
    console.log('🔄 ChatWindow: useEffect triggered for conversationId:', conversationId);
    if (conversationId) {
      loadConversation();
      loadMessages();
      joinChatRoom(conversationId);
      
      // No periodic refresh needed - real-time updates handle everything
      
      // Set up real-time message listeners (simplified like demo)
      const handleNewMessage = (messageData) => {
        console.log('📨 New message received:', messageData);
        
        // Update delivery status for pending messages and reload messages
        setMessages(prev => {
          const updatedMessages = prev.map(msg => {
            if (msg.deliveryStatus === 'sent' && msg.senderId === currentUser.id) {
              return { ...msg, deliveryStatus: 'delivered' };
            }
            return msg;
          });
          return updatedMessages;
        });
        
        // Reload messages to get the complete message data (like demo)
        setTimeout(() => {
          loadMessages();
        }, 100);
      };

      const handleMessageNotification = (notificationData) => {
        console.log('🔔 Message notification received:', notificationData);
        // Only handle notifications for the current chat
        if (notificationData.chatId === conversationId && notificationData.senderId !== currentUser.id) {
          // Reload messages to get the new message (like demo)
          loadMessages();
        }
      };

      // Listen for socket events
      socketService.on('new_message', handleNewMessage);
      socketService.on('message_notification', handleMessageNotification);
    }

    return () => {
      if (conversationId) {
        leaveChatRoom(conversationId);
        // Remove socket listeners
        socketService.off('new_message');
        socketService.off('message_notification');
      }
    };
  }, [conversationId, joinChatRoom, leaveChatRoom, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setNewMessage('');

    try {
      setSending(true);
      
      if (sellerId && !conversationId) {
        // Creating new conversation with seller - Optimistic update
        console.log('Creating conversation with sellerId:', sellerId);
        
        // Optimistically add the message immediately
        const optimisticMessage = {
          tempId,
          content: messageContent,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(), // Ensure timestamp is set
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent' // Start as 'sent' for instant feel
        };
        
        console.log('🚀 Adding optimistic message:', optimisticMessage);
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, messageContent, sellerId);
        console.log('📤 Sent message response:', sentMessage);
        // Update the optimistic message with real data
        setMessages(prev => {
          console.log('🔄 Current messages before replacement:', prev);
          const updated = prev.map(msg => {
            if (msg.tempId === tempId && !msg.id) { // Only replace if it still has tempId and no real id
              console.log('🔄 Replacing optimistic message with real data:', sentMessage);
              return { ...sentMessage, tempId };
            }
            return msg;
          });
          console.log('🔄 Messages after replacement:', updated);
          return updated;
        });
        
        // Instead of refreshing, trigger a conversation list reload
        // This will be handled by the parent component
        setTimeout(() => {
          // Trigger conversation list reload in parent
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        }, 1000);
        
      } else if (conversation) {
        // Existing conversation - Optimistic update
        const optimisticMessage = {
          tempId,
          content: messageContent,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(), // Ensure timestamp is set
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent' // Start as 'sent' for instant feel
        };
        
        // Add message immediately for smooth UX
        console.log('🚀 Adding optimistic message to existing conversation:', optimisticMessage);
        setMessages(prev => [...prev, optimisticMessage]);
        
        const receiverId = conversation.participant.id;
        const sentMessage = await sendMessage(conversationId, messageContent, receiverId);
        console.log('📤 Sent message response (existing conversation):', sentMessage);
        
        // Update the optimistic message with real data
        setMessages(prev => {
          console.log('🔄 Current messages before replacement (existing):', prev);
          const updated = prev.map(msg => {
            if (msg.tempId === tempId && !msg.id) { // Only replace if it still has tempId and no real id
              console.log('🔄 Replacing optimistic message with real data:', sentMessage);
              return { ...sentMessage, tempId };
            }
            return msg;
          });
          console.log('🔄 Messages after replacement (existing):', updated);
          return updated;
        });
        
        stopTyping(receiverId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      
      // Provide more specific error messages
      if (error.message.includes('Foreign key constraint violated') || error.message.includes('Unable to start conversation')) {
        setError('Unable to start conversation with this seller. This may be due to a data inconsistency. Please try contacting a different seller or refresh the page.');
      } else if (error.message.includes('does not exist')) {
        setError('This seller is no longer available. Please try contacting a different seller.');
      } else if (error.message.includes('Invalid receiverId format')) {
        setError('Invalid seller information. Please refresh the page and try again.');
      } else {
        setError(error.message || 'Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'timestamp:', timestamp);
      return 'Just now';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Today';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Today';
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'timestamp:', timestamp);
      return 'Today';
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!conversationId) {
    return (
      <div className="chat-container chat-layout-mobile flex flex-col h-full relative" style={{ backgroundColor: '#F7F5F0' }}>
        {/* Header for no conversation state */}
        {onBackToList && (
          <div className="chat-fixed-header px-4 py-3 border-b border-gray-200 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:shadow-none" style={{ backgroundColor: '#F7F5F0' }}>
            <button
              onClick={onBackToList}
              className="lg:hidden flex items-center space-x-3 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg font-semibold">New Chat</span>
            </button>
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center p-8 chat-no-conv-mobile" style={{ paddingTop: onBackToList ? '16px' : '32px' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatIcon className="w-8 h-8 text-gray-400" />
            </div>
            
            {sellerId ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500 mb-6">Send a message to start chatting with this seller</p>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </>
            )}
          </div>
        </div>

        {/* Fixed input for starting new conversation */}
        {sellerId && (
          <div className="chat-fixed-input px-4 py-3 border-t border-gray-200 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto" style={{ backgroundColor: '#F7F5F0' }}>
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setError(null); // Clear error when typing
                  }}
                  placeholder="Type a message"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  disabled={sending}
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // No loading spinner - seamless like demo

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-container chat-layout-mobile flex flex-col h-full relative" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Chat Header - Fixed */}
      <div className="chat-fixed-header px-4 py-3 border-b border-gray-200 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:shadow-none" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="flex items-center space-x-3">
          {/* Mobile Back Button */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {conversation?.participant.initials}
            </div>
            {conversation && onlineUsers.has(conversation.participant.id) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {conversation?.participant.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {conversation && onlineUsers.has(conversation.participant.id) ? 'Online' : 'Last seen recently'}
            </p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-1">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable with proper spacing for fixed header and input */}
      <div className="chat-messages-mobile flex-1 overflow-y-auto px-4 pb-4 space-y-4 chat-scrollbar" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        {loadingMessages ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ChatMessageSkeleton key={i} />
            ))}
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {formatDate(dateMessages[0].timestamp)}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                      message.isFromCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.isFromCurrentUser ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      <p className="text-xs">
                        {formatTime(message.timestamp)}
                      </p>
                      {message.isFromCurrentUser && (
                        <div className="">
                          {message.deliveryStatus === 'sent' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {message.deliveryStatus === 'delivered' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {message.deliveryStatus === 'read' && (
                            <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}

        {/* Typing Indicator */}
        {conversation && typingUsers.has(conversation.participant.id) && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-600 px-3 py-2 rounded-lg text-sm shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed */}
      <div className="chat-fixed-input px-4 py-3 border-t border-gray-200 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto" style={{ backgroundColor: '#F7F5F0' }}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (conversation) {
                  const receiverId = conversation.participant.id;
                  if (e.target.value.trim()) {
                    startTyping(receiverId);
                  } else {
                    stopTyping(receiverId);
                  }
                }
              }}
              onBlur={() => {
                if (conversation) {
                  stopTyping(conversation.participant.id);
                }
              }}
              placeholder="Type a message"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              disabled={sending}
            />
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
