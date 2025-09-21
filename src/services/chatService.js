// Real API service for chat functionality
import { chatApiService } from './chatApiService';

// Chat service functions
export const chatService = {
  // Get all conversations for the current user based on their role
  getConversations: async (currentUserRole = 'buyer') => {
    try {
      const apiChats = await chatApiService.getChats();
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const conversations = apiChats.map(chat => 
        chatApiService.transformChatData(chat, currentUserId)
      );

      // Filter conversations based on current user role
      if (currentUserRole === 'seller') {
        // Sellers see conversations where they are the seller
        return conversations.filter(conv => conv.participant.role === 'Buyer');
      } else {
        // Buyers (including non-sellers) see conversations where they are the buyer
        return conversations.filter(conv => conv.participant.role === 'Seller');
      }
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    try {
      const messages = await chatApiService.getChatMessages(conversationId);
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      return messages.map(message => ({
        ...message,
        isFromCurrentUser: message.senderId === currentUserId,
        timestamp: message.sentAt
      }));
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  },

  // Send a new message
  sendMessage: async (conversationId, content, receiverId) => {
    try {
      const message = await chatApiService.sendMessage(receiverId, content);
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      return {
        ...message,
        isFromCurrentUser: message.senderId === currentUserId,
        timestamp: message.sentAt
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Search conversations
  searchConversations: async (query, conversations = [], currentUserRole = 'buyer') => {
    try {
      console.log('🔍 ChatService: Searching with query:', query, 'role:', currentUserRole);
      
      if (!query.trim()) {
        console.log('🔍 ChatService: Empty query, returning all conversations');
        return conversations;
      }

      const filtered = conversations.filter(conv => {
        const nameMatch = conv.participant.name.toLowerCase().includes(query.toLowerCase());
        const messageMatch = conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(query.toLowerCase());
        const productMatch = conv.product && conv.product.name.toLowerCase().includes(query.toLowerCase());
        
        return nameMatch || messageMatch || productMatch;
      });
      
      console.log('🔍 ChatService: Filtered results:', filtered.length);
      return filtered;
    } catch (error) {
      console.error('Failed to search conversations:', error);
      return [];
    }
  },

  // Get conversation by ID
  getConversation: async (conversationId) => {
    try {
      const apiChats = await chatApiService.getChats();
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const conversations = apiChats.map(chat => 
        chatApiService.transformChatData(chat, currentUserId)
      );
      
      return conversations.find(conv => conv.id === conversationId);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      // For now, we'll just return true since the API doesn't have a mark as read endpoint
      // This could be implemented later if needed
      return true;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return false;
    }
  }
};

export default chatService;
