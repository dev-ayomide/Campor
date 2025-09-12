import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatContext = createContext(null);

export { ChatContext };

export function ChatProvider({ children }) {
  const { user, isSeller } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

  // Load conversations on mount and when user role changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Send message
  const sendMessage = async (conversationId, content) => {
    try {
      const message = await chatService.sendMessage(conversationId, content);
      
      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
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
      console.error('Failed to send message:', error);
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
      console.error('Failed to mark as read:', error);
    }
  }, [conversations]);

  // Search conversations with useCallback
  const searchConversations = useCallback(async (query) => {
    try {
      const results = await chatService.searchConversations(query, currentUserRole);
      setConversations(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [currentUserRole]);

  const contextValue = {
    conversations,
    selectedConversationId,
    unreadCount,
    loading,
    setSelectedConversationId,
    loadConversations,
    sendMessage,
    markAsRead,
    searchConversations
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
