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

      return messages.map(message => {
        // Transform the message data to ensure proper field mapping
        const transformedMessage = chatApiService.transformMessageData(message, currentUserId);
        return {
          ...transformedMessage,
          isFromCurrentUser: message.senderId === currentUserId,
          // Don't override timestamp - it's already set by transformMessageData
          // timestamp: message.sentAt  // This was causing the issue!
        };
      });
    } catch (error) {
      return [];
    }
  },

  // Send a new message
  sendMessage: async (conversationId, content, receiverId, imageUrl = null) => {
    try {
      const message = await chatApiService.sendMessage(receiverId, content, imageUrl);
      const currentUserId = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')).id 
        : null;

      return {
        ...message,
        isFromCurrentUser: message.senderId === currentUserId,
        timestamp: message.sentAt,
        imageUrl: message.imageUrl // Preserve imageUrl from server response
      };
    } catch (error) {
      throw error;
    }
  },

  // Search conversations
  searchConversations: async (query, conversations = [], currentUserRole = 'buyer') => {
    try {
      
      if (!query.trim()) {
        return conversations;
      }

      const filtered = conversations.filter(conv => {
        const nameMatch = conv.participant.name.toLowerCase().includes(query.toLowerCase());
        const messageMatch = conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(query.toLowerCase());
        const productMatch = conv.product && conv.product.name.toLowerCase().includes(query.toLowerCase());
        
        return nameMatch || messageMatch || productMatch;
      });
      
      return filtered;
    } catch (error) {
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
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    try {
      // Use the new API endpoint to mark messages as read
      const result = await chatApiService.markChatAsRead(conversationId);
      return result;
    } catch (error) {
      return false;
    }
  },

  // Update message with uploaded image URL (for background upload)
  updateMessageImage: async (messageId, imageUrl) => {
    try {
      const result = await chatApiService.updateMessageImage(messageId, imageUrl);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

export default chatService;
