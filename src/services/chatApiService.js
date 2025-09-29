// Real chat API service using the provided endpoints

// Validate that API_BASE_URL is set
if (!import.meta.env.VITE_API_BASE_URL) {
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ChatApiService {
  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('campor_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Validate UUID format
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Send a message to a user (matches working demo exactly)
  async sendMessage(receiverId, content) {
    try {
      // Get current user info for debugging
      const currentUser = localStorage.getItem('campor_user') 
        ? JSON.parse(localStorage.getItem('campor_user')) 
        : null;
      
      
      // Validate receiverId format
      if (!this.isValidUUID(receiverId)) {
        throw new Error(`Invalid receiverId format: ${receiverId}. Expected UUID format.`);
      }
      
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          receiverId,
          content
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Provide more specific error handling for foreign key constraint
      if (error.message.includes('Foreign key constraint violated')) {
        throw new Error(`Unable to start conversation with this seller. The seller ID may not exist in the system or there may be a data inconsistency. Please try contacting a different seller.`);
      }
      
      throw error;
    }
  }

  // Check if a user exists by trying to get chat with them
  async checkUserExists(userId) {
    try {
      // Try to get chat with user - if it works, the user exists
      const response = await fetch(`${API_BASE_URL}/chat/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        return true;
      } else if (response.status === 404) {
        return false;
      } else {
        // Other errors - assume user doesn't exist
        return false;
      }
    } catch (error) {
      console.error('Failed to check if user exists:', error);
      return false;
    }
  }

  // Get chat with a specific user
  async getChatWithUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/user/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      // Handle 404 as a normal case (chat doesn't exist)
      if (response.status === 404) {
        console.log('🔍 No existing chat found with user:', userId);
        return null;
      }

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      // If it's a 404, that's normal - chat doesn't exist
      if (error.message && error.message.includes('404')) {
        console.log('🔍 No existing chat found with user:', userId);
        return null;
      }
      console.error('Failed to get chat with user:', error);
      throw error;
    }
  }

  // Get all chats for the authenticated user
  async getChats() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/list`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse(response);
      // Return the data structure with chats and orders
      return result.data || { chats: [], orders: [] };
    } catch (error) {
      console.error('Failed to get chats:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw error;
    }
  }

  // Mark chat messages as read
  async markChatAsRead(chatId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/read/${chatId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
      throw error;
    }
  }

  // Transform API chat data to match our component structure
  transformChatData(apiChat, currentUserId) {
    const otherUser = apiChat.senderId === currentUserId ? apiChat.receiver : apiChat.sender;
    const lastMessage = apiChat.messages && apiChat.messages.length > 0 
      ? apiChat.messages[apiChat.messages.length - 1] 
      : null;

    return {
      id: apiChat.id,
      participant: {
        id: otherUser.id,
        name: otherUser.name,
        initials: this.getInitials(otherUser.name),
        role: this.determineUserRole(otherUser, currentUserId),
        avatar: null,
        isOnline: false // Will be updated via socket
      },
      product: {
        id: 'unknown', // Not provided in API, might need to be added
        name: 'Product Discussion',
        image: null,
        price: 0
      },
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        timestamp: lastMessage.sentAt,
        senderId: lastMessage.senderId,
        senderName: lastMessage.senderId === currentUserId ? 'You' : otherUser.name,
        read: lastMessage.read || false
      } : null,
      unreadCount: apiChat.unreadCount || 0,
      updatedAt: apiChat.updatedAt,
      conversationType: 'general' // Will be determined based on context
    };
  }

  // Transform API order data to match our component structure for order-grouped chats
  transformOrderData(order, currentUserId) {
    return {
      id: `order-${order.id}`,
      type: 'order',
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      settlementCodeExpiresAt: order.settlementCodeExpiresAt,
      participant: {
        id: 'multiple', // Multiple sellers in one order
        name: `${order.orderSellers.length} Seller${order.orderSellers.length > 1 ? 's' : ''}`,
        initials: 'OS', // Order Sellers
        role: 'Seller',
        avatar: null,
        isOnline: false
      },
      product: {
        id: order.id,
        name: `${order.orderItems.length} Item${order.orderItems.length > 1 ? 's' : ''}`,
        image: order.orderItems[0]?.product?.imageUrls?.[0] || null,
        price: order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      lastMessage: null, // Orders don't have direct messages
      unreadCount: 0,
      updatedAt: order.settlementCodeExpiresAt,
      conversationType: 'order',
      orderSellers: order.orderSellers.map(orderSeller => ({
        id: orderSeller.id,
        sellerId: orderSeller.sellerId,
        amountDue: orderSeller.amountDue,
        status: orderSeller.status,
        seller: {
          id: orderSeller.seller.id,
          catalogueName: orderSeller.seller.catalogueName,
          userId: orderSeller.seller.userId
        }
      })),
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrls: item.product.imageUrls,
          price: item.product.price
        }
      }))
    };
  }

  // Transform API message data to match our component structure
  transformMessageData(apiMessage, currentUserId) {
    return {
      id: apiMessage.id,
      content: apiMessage.content,
      timestamp: apiMessage.sentAt,
      senderId: apiMessage.senderId,
      senderName: apiMessage.senderId === currentUserId ? 'You' : 'Other User',
      isFromCurrentUser: apiMessage.senderId === currentUserId,
      read: apiMessage.read || false
    };
  }

  // Helper method to get initials from name
  getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Determine if a user is a buyer or seller based on context
  determineUserRole(otherUser, currentUserId) {
    // Get current user info to determine perspective
    const currentUser = localStorage.getItem('campor_user') 
      ? JSON.parse(localStorage.getItem('campor_user')) 
      : null;
    
    // If current user is a seller, then the other user is a buyer
    // If current user is a buyer, then the other user is a seller
    const currentUserIsSeller = currentUser?.seller || currentUser?.isSeller || currentUser?.sellerCompleted;
    
    if (currentUserIsSeller) {
      // Current user is seller, so other user is buyer
      return 'Buyer';
    } else {
      // Current user is buyer, so other user is seller
      return 'Seller';
    }
  }
}

export const chatApiService = new ChatApiService();
export default chatApiService;
