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
    /* BRUTE FORCE: Perfect mobile layout */
    .chat-layout-mobile {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 20 !important;
      overflow: hidden !important;
    }
    
    .chat-layout-mobile .chat-fixed-header {
      position: fixed !important;
      top: 80px !important; /* Directly below navbar */
      left: 0 !important;
      right: 0 !important;
      z-index: 50 !important; /* Above everything */
      background-color: #F7F5F0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 12px 16px !important;
      height: auto !important;
      min-height: 60px !important;
    }
    
    .chat-layout-mobile .chat-fixed-input {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 50 !important; /* Above everything */
      background-color: #F7F5F0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 12px 16px !important;
      height: auto !important;
      min-height: 60px !important;
    }
    
    .chat-layout-mobile .chat-messages-mobile {
      position: fixed !important;
      top: 140px !important; /* Below navbar + header */
      left: 0 !important;
      right: 0 !important;
      bottom: 60px !important; /* Above input */
      overflow-y: auto !important;
      overflow-x: hidden !important;
      padding: 16px !important;
      margin: 0 !important;
      z-index: 10 !important;
      background-color: #F7F5F0 !important;
      /* Force scroll to bottom */
      scroll-behavior: smooth !important;
    }
    
    .chat-layout-mobile .chat-no-conv-mobile {
      position: fixed !important;
      top: 140px !important; /* Below navbar + header */
      left: 0 !important;
      right: 0 !important;
      bottom: 60px !important; /* Above input */
      padding: 16px !important;
      margin: 0 !important;
      z-index: 10 !important;
      background-color: #F7F5F0 !important;
    }
    
    /* Force scroll to bottom for messages */
    .chat-layout-mobile .chat-messages-mobile::-webkit-scrollbar {
      display: none !important;
    }
    
    .chat-layout-mobile .chat-messages-mobile {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
  }
  
  @media (min-width: 1025px) {
    /* Fixed sidebar */
    .chat-sidebar-desktop {
      position: fixed !important;
      top: 80px !important; /* Below navbar */
      left: 0 !important;
      width: 320px !important;
      height: calc(100vh - 80px) !important;
      z-index: 25 !important;
      background-color: #F7F5F0 !important;
    }
    
    .chat-container {
      height: 100vh !important;
      display: flex !important;
      flex-direction: column !important;
      position: relative !important;
    }
    
    .chat-container .chat-fixed-header {
      position: fixed !important;
      top: 80px !important; /* Below navbar */
      left: 320px !important; /* After sidebar */
      right: 0 !important;
      z-index: 30 !important;
      flex-shrink: 0 !important;
      background-color: #F7F5F0 !important;
    }
    
    .chat-container .chat-messages-mobile {
      position: fixed !important;
      top: 160px !important; /* Below navbar + header */
      left: 320px !important; /* After sidebar */
      right: 0 !important;
      bottom: 80px !important; /* Above input */
      overflow-y: auto !important;
      padding: 16px !important;
      margin-top: 0 !important;
    }
    
    .chat-container .chat-fixed-input {
      position: fixed !important;
      bottom: 0 !important;
      left: 320px !important; /* After sidebar */
      right: 0 !important;
      z-index: 30 !important;
      flex-shrink: 0 !important;
      background-color: #F7F5F0 !important;
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
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Force scroll to bottom immediately
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto', // Changed to auto for immediate scroll
        block: 'end',
        inline: 'nearest'
      });
      
      // Additional brute force scroll
      setTimeout(() => {
        const messagesContainer = document.querySelector('.chat-messages-mobile');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 50);
    }
  };

  // Emoji picker functionality
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const retryMessage = async (tempId, content) => {
    // Update message status to sent immediately for smooth UX
    setMessages(prev => prev.map(msg => 
      msg.tempId === tempId 
        ? { ...msg, deliveryStatus: 'sent' }
        : msg
    ));

    try {
      const receiverId = conversation?.participant?.id || sellerId;
      const sentMessage = await sendMessage(conversationId, content, receiverId);
      
      // Message already appears as sent, just confirm with ID
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...sentMessage, tempId, deliveryStatus: 'sent' }
          : msg
      ));
    } catch (error) {
      console.error('Error retrying message:', error);
      // Show failure after delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...msg, deliveryStatus: 'failed' }
            : msg
        ));
      }, 500);
    }
  };

  const deleteFailedMessage = (tempId) => {
    setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
  };

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
    '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥',
    '⭐', '🌟', '💫', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇',
    '🎯', '🎪', '🎨', '🎭', '🎪', '🎸', '🎵', '🎶', '🎤', '🎧'
  ];

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
      const data = await chatService.getMessages(conversationId);
      console.log('📋 Loaded messages from API:', data);
      setMessages(data);
      
      // Mark messages as read
      markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
    }
  }, [conversationId, markAsRead]);

  useEffect(() => {
    console.log('🔄 ChatWindow: useEffect triggered for conversationId:', conversationId);
    if (conversationId) {
      // Handle seller-specific conversations from orders
      if (conversationId.startsWith('seller-')) {
        const userId = conversationId.replace('seller-', '');
        console.log('🔍 ChatWindow: Handling seller conversation for user ID:', userId);
        // Create a mock conversation like chat-demo does
        const mockConversation = {
          id: conversationId,
          type: 'seller',
          participant: {
            id: userId,
            name: 'Seller',
            initials: 'S',
            role: 'Seller',
            isOnline: false
          },
          lastMessage: null,
          unreadCount: 0
        };
        setConversation(mockConversation);
        setMessages([]);
        
        // Set up socket listeners for seller conversations
        const handleNewMessage = (messageData) => {
          console.log('📨 New message received for seller conversation:', messageData);
          // Reload messages to get the complete message data
          setTimeout(() => {
            // For seller conversations, we need to load messages differently
            // This will be handled when the conversation is properly created
          }, 100);
        };

        const handleMessageNotification = (notificationData) => {
          console.log('🔔 Message notification received for seller conversation:', notificationData);
          // Handle notifications for seller conversations
          if (notificationData.senderId !== currentUser.id) {
            // Reload messages when we get a notification
            setTimeout(() => {
              // This will be handled when the conversation is properly created
            }, 100);
          }
        };
        
        socketService.on('new_message', handleNewMessage);
        socketService.on('message_notification', handleMessageNotification);
      } else {
        loadConversation();
        loadMessages();
        joinChatRoom(conversationId);
        
        // Force scroll to bottom when component mounts
        setTimeout(() => {
          scrollToBottom();
          const messagesContainer = document.querySelector('.chat-messages-mobile');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 200);
        
        // No periodic refresh needed - real-time updates handle everything
        
        // Set up real-time message listeners (like chat-demo)
        const handleNewMessage = (messageData) => {
          console.log('📨 New message received:', messageData);
          
          // Update delivery status for pending messages and add new messages
          setMessages(prev => {
            const updatedMessages = prev.map(msg => {
              if (msg.deliveryStatus === 'pending' && msg.senderId === currentUser.id) {
                return { ...msg, deliveryStatus: 'sent' };
              }
              return msg;
            });
            return updatedMessages;
          });
          
          // Reload messages to get the complete message data (like demo)
          setTimeout(() => loadMessages(), 100);
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
        
        // Listen for conversation creation events
        const handleConversationCreated = () => {
          console.log('🔄 Conversation created, reloading conversation list');
          // Trigger conversation list reload
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        };
        
        socketService.on('conversation_created', handleConversationCreated);
        
        // Listen for new chat creation (when a new conversation is established)
        const handleNewChat = (chatData) => {
          console.log('🆕 New chat created:', chatData);
          // Trigger conversation list reload
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        };
        
        socketService.on('new_chat', handleNewChat);
        
        // Monitor connection status
        const checkConnection = () => {
          setIsConnected(socketService.connected);
        };
        
        const connectionInterval = setInterval(checkConnection, 1000);
        
        return () => {
          clearInterval(connectionInterval);
        };
      }
    }

    return () => {
      if (conversationId) {
        if (!conversationId.startsWith('seller-')) {
          leaveChatRoom(conversationId);
        }
        // Remove socket listeners for all conversation types
        socketService.off('new_message');
        socketService.off('message_notification');
        socketService.off('conversation_created');
        socketService.off('new_chat');
      }
    };
  }, [conversationId, joinChatRoom, leaveChatRoom, currentUser.id]);

  useEffect(() => {
    // Force scroll to bottom when messages change
    scrollToBottom();
    
    // Additional brute force scroll for mobile
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages-mobile');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    setNewMessage('');

    try {
      // Check for self-messaging
      if (conversationId && conversationId.startsWith('seller-')) {
        const userId = conversationId.replace('seller-', '');
        if (userId === currentUser.id) {
          alert('You cannot message yourself. Please select a different seller to chat with.');
          return;
        }
      }
      
      // Handle seller-specific conversations from orders
      if (conversationId && conversationId.startsWith('seller-')) {
        const userId = conversationId.replace('seller-', '');
        console.log('Creating conversation with seller user ID:', userId);
        
        // Optimistically add the message immediately - appears as sent (like chat-demo)
        const optimisticMessage = {
          tempId,
          content: messageContent,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent' // Start as 'sent' for instant feel
        };
        
        console.log('🚀 Adding optimistic message:', optimisticMessage);
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, messageContent, userId);
        console.log('📤 Sent message response:', sentMessage);
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent' }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessages();
          }
        }, 1000);
        
      } else if (sellerId && !conversationId) {
        // Creating new conversation with seller - Optimistic update (like chat-demo)
        console.log('Creating conversation with sellerId:', sellerId);
        
        // Optimistically add the message immediately - appears as sent
        const optimisticMessage = {
          tempId,
          content: messageContent,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
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
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent' }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessages();
          }
        }, 1000);
        
      } else if (conversation) {
        // Existing conversation - Optimistic update (like chat-demo)
        const optimisticMessage = {
          tempId,
          content: messageContent,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
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
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent' }
            : msg
        ));
        
        stopTyping(receiverId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show failure state instead of removing message (like chat-demo)
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...msg, deliveryStatus: 'failed' }
            : msg
        ));
      }, 500);
      
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
      <div className="chat-container chat-layout-mobile flex flex-col h-full relative lg:flex lg:flex-col lg:h-full" style={{ backgroundColor: '#F7F5F0' }}>
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
              {/* Emoji Picker Button - Desktop Only */}
              <div className="hidden lg:block relative emoji-picker-container">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 max-h-80 overflow-y-auto z-50 w-80">
                    <div className="grid grid-cols-10 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-xl transition-colors duration-150"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Emoji Button - Non-functional */}
              <div className="lg:hidden">
                <button
                  type="button"
                  className="p-2 text-gray-400 transition-colors rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
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
                  disabled={false}
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
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
    <div className="chat-container chat-layout-mobile flex flex-col h-full relative lg:flex lg:flex-col lg:h-full" style={{ backgroundColor: '#F7F5F0' }}>
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
            {conversation?.participant?.profileImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={conversation.participant.profileImage} 
                  alt={conversation.participant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {conversation?.participant?.initials || 'U'}
              </div>
            )}
              {conversation?.participant && onlineUsers.has(conversation.participant.id) && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {conversation?.participant?.name || 'Unknown User'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                conversation?.participant && onlineUsers.has(conversation.participant.id) 
                  ? 'text-green-500' 
                  : 'text-gray-500'
              }`}>
                {conversation?.participant && onlineUsers.has(conversation.participant.id) ? 'Online' : 'Last seen recently'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable with proper spacing for fixed header and input */}
      <div className="chat-messages-mobile flex-1 overflow-y-auto px-4 pb-4 space-y-4 chat-scrollbar lg:flex-1 lg:overflow-y-auto lg:px-4 lg:pb-4 lg:space-y-4" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        {(
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
                        ? message.deliveryStatus === 'failed' 
                          ? 'bg-red-500 text-white rounded-br-sm'
                          : 'bg-blue-500 text-white rounded-br-sm'
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
                          {message.deliveryStatus === 'failed' && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Retry functionality for failed messages */}
                  {message.isFromCurrentUser && message.deliveryStatus === 'failed' && (
                    <div className="flex items-center mt-1 space-x-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-red-700 font-medium">Message failed to send</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => retryMessage(message.tempId, message.content)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Retry
                          </button>
                          <button
                            onClick={() => deleteFailedMessage(message.tempId)}
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
      <div className="chat-fixed-input px-4 py-3 border-t border-gray-200 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:flex-shrink-0" style={{ backgroundColor: '#F7F5F0' }}>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          {/* Emoji Picker Button - Desktop Only */}
          <div className="hidden lg:block relative emoji-picker-container">
          <button
            type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 max-h-80 overflow-y-auto z-50 w-80">
                <div className="grid grid-cols-10 gap-2">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-xl transition-colors duration-150"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Emoji Button - Non-functional */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 text-gray-400 transition-colors rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
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
            disabled={false}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
            {!isConnected && (
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
