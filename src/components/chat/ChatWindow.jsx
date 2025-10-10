import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../services/chatService';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { socketService } from '../../services/socketService';
import { uploadImage } from '../../services/cloudinaryService';
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
  // Initialize conversation state with seller info if it's a seller conversation
  const getInitialConversation = () => {
    if (conversationId && conversationId.startsWith('seller-')) {
      // Parse the new format: seller-userId::catalogueName
      let userId, catalogueName;
      
      if (conversationId.includes('::')) {
        // New format with seller info
        const [sellerPart, namePart] = conversationId.split('::');
        userId = sellerPart.replace('seller-', '');
        catalogueName = namePart;
      } else {
        // Old format fallback
        userId = conversationId.replace('seller-', '');
        catalogueName = 'Seller';
      }
      
      return {
        id: conversationId,
        type: 'seller',
        participant: {
          id: userId,
          name: catalogueName,
          initials: catalogueName.charAt(0).toUpperCase(),
          role: 'Seller',
          isOnline: false
        },
        lastMessage: null,
        unreadCount: 0
      };
    }
    return null;
  };

  const [conversation, setConversation] = useState(getInitialConversation());
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: null });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Immediately initialize seller conversations to prevent 'Unknown User' flash
  const initializeSellerConversation = (convId) => {
    if (convId && convId.startsWith('seller-')) {
      // Parse the new format: seller-userId::catalogueName
      let userId, catalogueName;
      
      if (convId.includes('::')) {
        // New format with seller info
        const [sellerPart, namePart] = convId.split('::');
        userId = sellerPart.replace('seller-', '');
        catalogueName = namePart;
      } else {
        // Old format fallback
        userId = convId.replace('seller-', '');
        catalogueName = 'Seller';
      }
      
      // Create mock conversation immediately
      const mockConversation = {
        id: convId,
        type: 'seller',
        participant: {
          id: userId,
          name: catalogueName,
          initials: catalogueName.charAt(0).toUpperCase(),
          role: 'Seller',
          isOnline: false
        },
        lastMessage: null,
        unreadCount: 0
      };
      
      return mockConversation;
    }
    return null;
  };

  // Initialize conversation immediately if it's a seller conversation
  const initialConversation = initializeSellerConversation(conversationId);
  if (initialConversation && !conversation) {
    setConversation(initialConversation);
  }

  const scrollToBottom = () => {
    // Multiple approaches to ensure scrolling works on all devices
    const scrollToBottomImmediate = () => {
      // Method 1: Use scrollIntoView on the ref
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
          behavior: 'auto',
        block: 'end',
        inline: 'nearest'
      });
      }
      
      // Method 2: Direct scroll on container
        const messagesContainer = document.querySelector('.chat-messages-mobile');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      
      // Method 3: Use window scroll as fallback
      window.scrollTo(0, document.body.scrollHeight);
    };
    
    // Execute immediately
    scrollToBottomImmediate();
    
    // Execute again after a short delay to handle dynamic content
    setTimeout(scrollToBottomImmediate, 50);
    
    // Execute once more after a longer delay for slow rendering
    setTimeout(scrollToBottomImmediate, 200);
  };

  // Emoji picker functionality
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Image modal functions
  const openImageModal = (imageUrl) => {
    setImageModal({ isOpen: true, imageUrl });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: null });
  };

  // Handle keyboard events for image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && imageModal.isOpen) {
        closeImageModal();
      }
    };

    if (imageModal.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [imageModal.isOpen]);

  // Handle image upload (happens on send)
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      // Upload image to Cloudinary
      const uploadResult = await uploadImage(file, {
        folder: 'samples/ecommerce/chat-images'
      });
      
      return uploadResult.url;
    } catch (error) {
      setError(`Failed to upload image: ${error.message}`);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file input change - set local preview and allow caption before sending
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError(null);
    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImagePreviewUrl(objectUrl);
    // Allow selecting the same file again later
    event.target.value = '';
    // Focus input and scroll bottom so user sees the preview and can type
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  };

  // Trigger file input
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.getMessages(conversationId);
      
      // Merge new messages with existing ones to prevent flickering
      setMessages(prevMessages => {
        const newMessages = data.map(message => ({
          ...message,
          isFromCurrentUser: message.senderId === currentUser.id,
          timestamp: message.sentAt
        }));
        
        // If we have existing messages, merge them intelligently
        if (prevMessages.length > 0) {
          // Create a map of existing messages by ID for quick lookup
          const existingMessagesMap = new Map();
          prevMessages.forEach(msg => {
            if (msg.id) existingMessagesMap.set(msg.id, msg);
            if (msg.tempId) existingMessagesMap.set(msg.tempId, msg);
          });
          
          // Merge messages, preserving delivery status from optimistic updates
          const mergedMessages = newMessages.map(newMsg => {
            // Check if this message exists in previous messages
            const existingMsg = existingMessagesMap.get(newMsg.id);
            
            if (existingMsg && existingMsg.tempId) {
              // This is a confirmed optimistic message - preserve its delivery status, content, and timestamp
              return {
                ...newMsg,
                content: newMsg.content || existingMsg.content, // Preserve content from optimistic update if server doesn't have it
                imageUrl: newMsg.imageUrl || existingMsg.imageUrl, // Preserve imageUrl from optimistic update if server doesn't have it
                timestamp: existingMsg.timestamp || newMsg.timestamp, // Preserve timestamp from optimistic update
                sentAt: existingMsg.sentAt || newMsg.sentAt, // Preserve sentAt from optimistic update
                deliveryStatus: existingMsg.deliveryStatus || 'sent',
                tempId: existingMsg.tempId
              };
            }
            
            return newMsg;
          });
          
          // Add any optimistic messages that aren't in the new data
          prevMessages.forEach(prevMsg => {
            if (prevMsg.tempId && !existingMessagesMap.has(prevMsg.id)) {
              // This is an optimistic message that hasn't been confirmed yet
              mergedMessages.push(prevMsg);
            }
          });
          
          // Sort by timestamp
          return mergedMessages.sort((a, b) => new Date(a.timestamp || a.sentAt) - new Date(b.timestamp || b.sentAt));
        }
        
        return newMessages;
      });
      
      // Mark messages as read
      markAsRead(conversationId);
    } catch (error) {
    } finally {
    }
  }, [conversationId, markAsRead, currentUser.id]);

  // Load messages with specific chat ID (for seller conversations)
  const loadMessagesWithChatId = useCallback(async (chatId) => {
    try {
      // For seller conversations, we need to extract the user ID from the chat ID
      let actualChatId = chatId;
      
      if (chatId.startsWith('seller-')) {
        // Extract userId from seller-userId::catalogueName format
        actualChatId = chatId.includes('::') 
          ? chatId.split('::')[0].replace('seller-', '')
          : chatId.replace('seller-', '');
      }
      
      const data = await chatService.getMessages(actualChatId);
      
      // Merge new messages with existing ones to prevent flickering
      setMessages(prevMessages => {
        const newMessages = data.map(message => ({
          ...message,
          isFromCurrentUser: message.senderId === currentUser.id,
          timestamp: message.sentAt
        }));
        
        // If we have existing messages, merge them intelligently
        if (prevMessages.length > 0) {
          // Create a map of existing messages by ID for quick lookup
          const existingMessagesMap = new Map();
          prevMessages.forEach(msg => {
            if (msg.id) existingMessagesMap.set(msg.id, msg);
            if (msg.tempId) existingMessagesMap.set(msg.tempId, msg);
          });
          
          // Merge messages, preserving delivery status from optimistic updates
          const mergedMessages = newMessages.map(newMsg => {
            // Check if this message exists in previous messages
            const existingMsg = existingMessagesMap.get(newMsg.id);
            
            if (existingMsg && existingMsg.tempId) {
              // This is a confirmed optimistic message - preserve its delivery status, content, and timestamp
              return {
                ...newMsg,
                content: newMsg.content || existingMsg.content, // Preserve content from optimistic update if server doesn't have it
                imageUrl: newMsg.imageUrl || existingMsg.imageUrl, // Preserve imageUrl from optimistic update if server doesn't have it
                timestamp: existingMsg.timestamp || newMsg.timestamp, // Preserve timestamp from optimistic update
                sentAt: existingMsg.sentAt || newMsg.sentAt, // Preserve sentAt from optimistic update
                deliveryStatus: existingMsg.deliveryStatus || 'sent',
                tempId: existingMsg.tempId
              };
            }
            
            return newMsg;
          });
          
          // Add any optimistic messages that aren't in the new data
          prevMessages.forEach(prevMsg => {
            if (prevMsg.tempId && !existingMessagesMap.has(prevMsg.id)) {
              // This is an optimistic message that hasn't been confirmed yet
              mergedMessages.push(prevMsg);
            }
          });
          
          // Sort by timestamp
          return mergedMessages.sort((a, b) => new Date(a.timestamp || a.sentAt) - new Date(b.timestamp || b.sentAt));
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (conversationId) {
      // Handle seller-specific conversations from orders
      if (conversationId.startsWith('seller-')) {
        // Parse the new format: seller-userId::catalogueName
        let userId, catalogueName;
        
        if (conversationId.includes('::')) {
          // New format with seller info
          const [sellerPart, namePart] = conversationId.split('::');
          userId = sellerPart.replace('seller-', '');
          catalogueName = namePart;
        } else {
          // Old format fallback
          userId = conversationId.replace('seller-', '');
          catalogueName = 'Seller';
        }
        
        
        // Only set conversation if it's not already initialized
        if (!conversation) {
          // Create a mock conversation with actual seller name
          const mockConversation = {
            id: conversationId,
            type: 'seller',
            participant: {
              id: userId,
              name: catalogueName,
              initials: catalogueName.charAt(0).toUpperCase(),
              role: 'Seller',
              isOnline: false
            },
            lastMessage: null,
            unreadCount: 0
          };
          setConversation(mockConversation);
        }
        // Load messages for seller conversations
        loadMessages();
        
        // Set up socket listeners for seller conversations
        const handleNewMessage = (messageData) => {
          // Reload messages to get the complete message data
          setTimeout(() => {
            loadMessages();
          }, 100);
        };

        const handleMessageNotification = (notificationData) => {
          // Handle notifications for seller conversations
          if (notificationData.senderId !== currentUser.id) {
            // Reload messages when we get a notification
            setTimeout(() => {
              loadMessages();
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
          // Trigger conversation list reload
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        };
        
        socketService.on('conversation_created', handleConversationCreated);
        
        // Listen for new chat creation (when a new conversation is established)
        const handleNewChat = (chatData) => {
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
  }, [messages]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    // Initial scroll to bottom when component loads
    setTimeout(scrollToBottom, 200);
  }, []);

  // Scroll to bottom when conversation changes (new chat opened)
  useEffect(() => {
    if (conversation) {
      // Delay to ensure DOM is ready
      setTimeout(scrollToBottom, 100);
    }
  }, [conversation]);

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

  const handleSendMessageWithImage = async (content, imageUrl) => {
    const messageContent = content.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Validate that we have either content or imageUrl
    if (!messageContent && !imageUrl) {
      setError('Please provide a message or select an image');
      return;
    }

    try {
      // Check for self-messaging
      if (conversationId && conversationId.startsWith('seller-')) {
        // Parse seller userId from new format: seller-userId::catalogueName
        const userId = conversationId.includes('::') 
          ? conversationId.split('::')[0].replace('seller-', '')
          : conversationId.replace('seller-', '');
        if (userId === currentUser.id) {
          alert('You cannot message yourself. Please select a different seller to chat with.');
          return;
        }
      }
      
      // Handle seller-specific conversations from orders
      if (conversationId && conversationId.startsWith('seller-')) {
        // Parse seller userId from new format: seller-userId::catalogueName
        const userId = conversationId.includes('::') 
          ? conversationId.split('::')[0].replace('seller-', '')
          : conversationId.replace('seller-', '');
        
        // Optimistically add the message immediately - appears as sent
        const optimisticMessage = {
          tempId,
          content: messageContent || null, // Only set content if there's actual text
          imageUrl: imageUrl,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent'
        };
        
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, messageContent, userId, imageUrl);
        
        // Message already appears as sent, just confirm it silently
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent', imageUrl: imageUrl }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessagesWithChatId(sentMessage.chatId);
          }
        }, 500); // Reduced from 1000ms to 500ms
        
      } else if (sellerId && !conversationId) {
        // Creating new conversation with seller - Optimistic update
        const optimisticMessage = {
          tempId,
          content: messageContent || null, // Only set content if there's actual text
          imageUrl: imageUrl,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent'
        };
        
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, messageContent, sellerId, imageUrl);
        
        // Message already appears as sent, just confirm it silently
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent', imageUrl: imageUrl }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessagesWithChatId(sentMessage.chatId);
          }
        }, 500); // Reduced from 1000ms to 500ms
        
      } else if (conversation) {
        // Existing conversation - Optimistic update
        const optimisticMessage = {
          tempId,
          content: messageContent || null, // Only set content if there's actual text
          imageUrl: imageUrl,
          senderId: currentUser.id,
          sentAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            name: currentUser.name || 'You'
          },
          isFromCurrentUser: true,
          deliveryStatus: 'sent'
        };
        
        // Add message immediately for smooth UX
        setMessages(prev => [...prev, optimisticMessage]);
        
        const receiverId = conversation.participant.id;
        const sentMessage = await sendMessage(conversationId, messageContent, receiverId, imageUrl);
        
        // Message already appears as sent, just confirm it silently
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { ...sentMessage, tempId, deliveryStatus: 'sent', imageUrl: imageUrl }
            : msg
        ));
        
        stopTyping(receiverId);
      }
    } catch (error) {
      // Show failure state instead of removing message
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImageFile) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    try {
      // Only clear input after we're sure we can send the message
      setNewMessage('');
      
      // Prepare message content - send null if empty, not empty string
      const finalMessageContent = messageContent || null;
      let uploadedImageUrl = null;
      if (selectedImageFile) {
        setUploadingImage(true);
        uploadedImageUrl = await handleImageUpload(selectedImageFile);
      }
      // Check for self-messaging
      if (conversationId && conversationId.startsWith('seller-')) {
        // Parse seller userId from new format: seller-userId::catalogueName
        const userId = conversationId.includes('::') 
          ? conversationId.split('::')[0].replace('seller-', '')
          : conversationId.replace('seller-', '');
        if (userId === currentUser.id) {
          alert('You cannot message yourself. Please select a different seller to chat with.');
          return;
        }
      }
      
      // Handle seller-specific conversations from orders
      if (conversationId && conversationId.startsWith('seller-')) {
        // Parse seller userId from new format: seller-userId::catalogueName
        const userId = conversationId.includes('::') 
          ? conversationId.split('::')[0].replace('seller-', '')
          : conversationId.replace('seller-', '');
        
        // Optimistically add the message immediately - appears as sent (like chat-demo)
        const optimisticMessage = {
          tempId,
          content: finalMessageContent || null,
          imageUrl: uploadedImageUrl || null,
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
        
        
        
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, finalMessageContent, userId, uploadedImageUrl);
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { 
                ...sentMessage, 
                tempId, 
                deliveryStatus: 'sent', 
                timestamp: msg.timestamp, // Preserve timestamp from optimistic message
                sentAt: msg.sentAt, // Preserve sentAt from optimistic message
                imageUrl: uploadedImageUrl || sentMessage.imageUrl || null
              }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessagesWithChatId(sentMessage.chatId);
          }
        }, 1000); // Increased timeout to give confirmation more time
        
      } else if (sellerId && !conversationId) {
        // Creating new conversation with seller - Optimistic update (like chat-demo)
        // Optimistically add the message immediately - appears as sent
        const optimisticMessage = {
          tempId,
          content: finalMessageContent || null,
          imageUrl: uploadedImageUrl || null,
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
        
        setMessages([optimisticMessage]);
        
        const sentMessage = await sendMessage(null, finalMessageContent, sellerId, uploadedImageUrl);
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { 
                ...sentMessage, 
                tempId, 
                deliveryStatus: 'sent', 
                imageUrl: uploadedImageUrl || sentMessage.imageUrl || null,
                timestamp: msg.timestamp, // Preserve timestamp from optimistic message
                sentAt: msg.sentAt // Preserve sentAt from optimistic message
              }
            : msg
        ));
        
        // Trigger conversation list reload and reload messages for the new conversation
        setTimeout(() => {
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
          // Reload messages to get the complete conversation
          if (sentMessage.chatId) {
            loadMessagesWithChatId(sentMessage.chatId);
          }
        }, 500); // Reduced from 1000ms to 500ms
        
      } else if (conversation) {
        // Existing conversation - Optimistic update (like chat-demo)
        const optimisticMessage = {
          tempId,
          content: finalMessageContent || null, // Only set content if there's actual text
          imageUrl: uploadedImageUrl || null,
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
        setMessages(prev => [...prev, optimisticMessage]);
        
        const receiverId = conversation.participant.id;
        const sentMessage = await sendMessage(conversationId, finalMessageContent, receiverId, uploadedImageUrl);
        
        // Message already appears as sent, just confirm it silently (like chat-demo)
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId 
            ? { 
                ...sentMessage, 
                tempId, 
                deliveryStatus: 'sent', 
                imageUrl: uploadedImageUrl || sentMessage.imageUrl || null,
                timestamp: msg.timestamp, // Preserve timestamp from optimistic message
                sentAt: msg.sentAt // Preserve sentAt from optimistic message
              }
            : msg
        ));
        
        stopTyping(receiverId);
      }
      // Clear selected image state after successful send
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl(null);

    } catch (error) {
      // Restore input state if there was an error
      setNewMessage(messageContent);
      
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
    } finally {
      setUploadingImage(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      // Show absolute time like "10:54 PM"
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a conversation with {conversation?.participant?.name || 'this seller'}
                </h3>
                <p className="text-gray-500 mb-6">Send a message to start chatting with {conversation?.participant?.name || 'this seller'}</p>
                
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
              
              {/* Image Upload Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={triggerImageUpload}
                  disabled={uploadingImage}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1 relative">
                {selectedImagePreviewUrl && (
                  <div className="absolute -top-20 left-0 flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 shadow z-10">
                    <img src={selectedImagePreviewUrl} alt="preview" className="w-12 h-12 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => { setSelectedImageFile(null); setSelectedImagePreviewUrl(null); }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setError(null); // Clear error when typing
                  }}
                  placeholder={`Type a message to ${conversation?.participant?.name || 'this seller'}...`}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  disabled={false}
                />
                
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImageFile) || uploadingImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingImage ? (
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
                {conversation?.participant?.initials || (
                  <div className="w-4 h-4 bg-white bg-opacity-30 rounded animate-pulse"></div>
                )}
              </div>
            )}
              {conversation?.participant && onlineUsers.has(conversation.participant.id) && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {conversation?.participant?.name || (
                  <span className="animate-pulse bg-gray-200 h-6 w-24 rounded"></span>
                )}
              </h3>
              {/* Seller Badge for new conversations */}
              {conversationId && conversationId.startsWith('seller-') && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Seller
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                conversation?.participant && onlineUsers.has(conversation.participant.id) 
                  ? 'text-green-500' 
                  : 'text-gray-500'
              }`}>
                {conversation?.participant && onlineUsers.has(conversation.participant.id) ? 'Online' : 'Last seen recently'}
              </span>
              {/* Additional context for new seller conversations */}
              {conversationId && conversationId.startsWith('seller-') && (
                <span className="text-xs text-gray-500">• Starting new conversation</span>
              )}
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
                    className={`px-3 py-2 rounded-lg shadow-sm ${
                      message.isFromCurrentUser
                        ? message.deliveryStatus === 'failed' 
                          ? 'bg-red-500 text-white rounded-br-sm'
                          : 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
                    }`}
                    style={{
                      // WhatsApp-like fixed width for message bubbles
                      maxWidth: message.imageUrl ? '240px' : '280px',
                      width: 'fit-content'
                    }}
                  >
                    {/* Image message */}
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Chat image" 
                          className="w-full max-w-[200px] h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                          onClick={() => openImageModal(message.imageUrl)}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fallback for failed image loads */}
                        <div className="hidden items-center justify-center bg-gray-100 rounded-lg p-4 text-gray-500 text-sm">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image failed to load
                        </div>
                      </div>
                    )}
                    
                    {/* Text content - matches image width when both are present */}
                    {message.content && (
                    <p 
                      className="text-sm leading-relaxed break-words"
                      style={{
                        // Match the image width when both image and text are present
                        maxWidth: message.imageUrl ? '200px' : 'none'
                      }}
                    >
                      {message.content}
                    </p>
                    )}
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.isFromCurrentUser ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      <p className="text-xs">
                        {formatTime(message.timestamp || message.sentAt)}
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
        
        {/* Image Preview - Floating above input */}
        {selectedImagePreviewUrl && (
          <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <img 
                src={selectedImagePreviewUrl} 
                alt="Preview" 
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-600">Image selected</div>
              </div>
          <button
            type="button"
                onClick={() => {
                  if (selectedImagePreviewUrl) URL.revokeObjectURL(selectedImagePreviewUrl);
                  setSelectedImageFile(null);
                  setSelectedImagePreviewUrl(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
                </div>
              </div>
            )}
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          
          
          {/* Image Upload Button */}
          <div className="relative">
            <button
              type="button"
              onClick={triggerImageUpload}
              disabled={uploadingImage}
              className={`p-3 sm:p-2 transition-all duration-200 rounded-full disabled:opacity-50 hover:bg-gray-100 active:bg-gray-200 ${
                selectedImageFile 
                  ? 'text-blue-500 bg-blue-50 border-2 border-blue-200' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={selectedImageFile ? "Change image" : "Add image"}
            >
              {uploadingImage ? (
                <div className="w-6 h-6 sm:w-5 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : selectedImageFile ? (
                <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {selectedImageFile && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
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
                  disabled={(!newMessage.trim() && !selectedImageFile) || uploadingImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
            {!isConnected && (
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
                    </>
                  )}
          </button>
          </div>
        </form>
      </div>

      {/* Image Modal - WhatsApp Style */}
      {imageModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={imageModal.imageUrl} 
              alt="Full size image" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Download button */}
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageModal.imageUrl;
                link.download = 'image.jpg';
                link.target = '_blank';
                link.click();
              }}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
