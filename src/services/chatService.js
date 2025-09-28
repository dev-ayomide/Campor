// Real API service for chat functionality
import { chatApiService } from './chatApiService';

// Chat service functions
export const chatService = {
  // Get all conversations and orders for the current user
  getConversations: async (currentUserRole = 'buyer') => {
    try {
      const response = await chatApiService.getChats();
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 ChatService: Raw API response:', response);

      // Handle the new structure with chats and orders
      const { chats = [], orders = [] } = response;

      // Transform individual chats
      const transformedChats = chats.map(chat => 
        chatApiService.transformChatData(chat, currentUserId)
      );

      // Transform orders into order-grouped conversations
      const orderConversations = orders.map(order => 
        chatApiService.transformOrderData(order, currentUserId)
      );

      // Combine all conversations
      const allConversations = [...transformedChats, ...orderConversations];

      // Filter conversations based on current user role
      if (currentUserRole === 'seller') {
        // Sellers see conversations where they are the seller, plus all order conversations
        return allConversations.filter(conv => 
          conv.type === 'order' || conv.participant.role === 'Buyer'
        );
      } else {
        // Buyers (including non-sellers) see conversations where they are the buyer, plus all order conversations
        return allConversations.filter(conv => 
          conv.type === 'order' || conv.participant.role === 'Seller'
        );
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
      const response = await chatApiService.getChats();
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Handle the new structure with chats and orders
      const { chats = [], orders = [] } = response;

      // Transform individual chats
      const transformedChats = chats.map(chat => 
        chatApiService.transformChatData(chat, currentUserId)
      );

      // Transform orders into order-grouped conversations
      const orderConversations = orders.map(order => 
        chatApiService.transformOrderData(order, currentUserId)
      );

      // Combine all conversations
      const allConversations = [...transformedChats, ...orderConversations];
      
      return allConversations.find(conv => conv.id === conversationId);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      // Use the new API endpoint to mark messages as read
      const result = await chatApiService.markChatAsRead(conversationId);
      console.log('✅ Messages marked as read:', result);
      return result;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return false;
    }
  }
};

export default chatService;
