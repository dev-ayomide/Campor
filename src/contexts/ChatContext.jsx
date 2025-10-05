import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

const ChatContext = createContext(null);

export { ChatContext };

export function ChatProvider({ children }) {
  const { user, isSeller, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Determine current user role
  const currentUserRole = isSeller ? 'seller' : 'buyer';

  // Load conversations with useCallback to prevent infinite re-renders
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations(currentUserRole);
      setConversations(data);
      
      // Calculate total unread count
      const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token && user) {
      const connectSocket = async () => {
        try {
          await socketService.connect(token);
        } catch (error) {
          // Retry connection after 3 seconds
          setTimeout(() => {
            connectSocket();
          }, 3000);
        }
      };
      
      connectSocket();
      
      // Set up real-time event listeners
      socketService.on('new_message', (messageData) => {
        // Only update conversation list, don't handle individual messages
        // Individual messages are handled in ChatWindow component
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === messageData.chatId) {
              return {
                ...conv,
                lastMessage: {
                  id: messageData.id,
                  content: messageData.text || messageData.content, // Handle both field names
                  imageUrl: messageData.imageUrl, // Include imageUrl
                  timestamp: messageData.sentAt,
                  senderId: messageData.senderId,
                  senderName: messageData.senderId === user.id ? 'You' : 'Other User'
                },
                updatedAt: messageData.sentAt
              };
            }
            return conv;
          })
        );
      });

      socketService.on('user_typing', (typingData) => {
        if (typingData.isTyping) {
          setTypingUsers(prev => new Set([...prev, typingData.userId]));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(typingData.userId);
            return newSet;
          });
        }
      });

      socketService.on('user_status_change', (statusData) => {
        if (statusData.status === 'online') {
          setOnlineUsers(prev => new Set([...prev, statusData.userId]));
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(statusData.userId);
            return newSet;
          });
        }
      });
      
      // Listen for conversation creation events
      socketService.on('conversation_created', () => {
        loadConversations();
      });
      
      socketService.on('new_chat', (chatData) => {
        loadConversations();
      });

      socketService.on('message_notification', (notificationData) => {
        // Handle message notification
        // Don't reload conversations here - let the new_message event handle updates
        // This prevents duplication and unnecessary API calls
      });

      return () => {
        socketService.cleanup();
        socketService.disconnect();
      };
    }
  }, [token, user]);

  // Load conversations on mount and when user role changes
  useEffect(() => {

    loadConversations();
  }, [loadConversations]);

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

  // Send message
  const sendMessage = async (conversationId, content, receiverId, imageUrl = null) => {
    try {
      const message = await chatService.sendMessage(conversationId, content, receiverId, imageUrl);
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  imageUrl: message.imageUrl,
                  timestamp: message.timestamp,
                  senderId: message.senderId,
                  senderName: message.senderName
                },
                updatedAt: message.timestamp
              }
            : conv
        )
      );
      
      return message;
    } catch (error) {

      throw error;
    }
  };

  // Mark conversation as read with useCallback
  const markAsRead = useCallback(async (conversationId) => {
    try {
      await chatService.markAsRead(conversationId);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const updatedConversations = conversations.map(conv => 
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        );
        return updatedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      });
    } catch (error) {

    }
  }, [conversations]);

  // Search conversations with useCallback
  const searchConversations = useCallback(async (query) => {
    try {

      const results = await chatService.searchConversations(query, conversations, currentUserRole);

      setConversations(results);
    } catch (error) {

    }
  }, [conversations, currentUserRole]);

  // Join chat room for real-time updates
  const joinChatRoom = useCallback((chatId) => {
    if (chatId) {
      socketService.joinChat(chatId);
    }
  }, []);

  // Leave chat room
  const leaveChatRoom = useCallback((chatId) => {
    if (chatId) {
      socketService.leaveChat(chatId);
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback((receiverId) => {
    if (receiverId) {
      socketService.startTyping(receiverId);
    }
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((receiverId) => {
    if (receiverId) {
      socketService.stopTyping(receiverId);
    }
  }, []);

  const contextValue = {
    conversations,
    selectedConversationId,
    unreadCount,
    loading,
    typingUsers,
    onlineUsers,
    setSelectedConversationId,
    loadConversations,
    sendMessage,
    markAsRead,
    searchConversations,
    joinChatRoom,
    leaveChatRoom,
    startTyping,
    stopTyping
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === null || context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
