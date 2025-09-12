// Mock data service for chat functionality
// This will be replaced with actual API calls later

// Mock conversations data - dynamically filtered based on current user role
const mockConversations = [
  {
    id: 'conv_1',
    participant: {
      id: 'user_1',
      name: 'Ahmed Okafor',
      initials: 'AO',
      role: 'Buyer',
      avatar: null,
      isOnline: true
    },
    product: {
      id: 'prod_1',
      name: 'Nike Air Force 1',
      image: '/src/assets/images/product.png',
      price: 25000
    },
    lastMessage: {
      id: 'msg_1',
      content: 'what colours do you have avai..',
      timestamp: '2024-01-15T18:12:00Z',
      senderId: 'user_1',
      senderName: 'Ahmed Okafor'
    },
    unreadCount: 2,
    updatedAt: '2024-01-15T18:12:00Z',
    conversationType: 'buyer_to_seller' // Current user is buyer, chatting with seller
  },
  {
    id: 'conv_2',
    participant: {
      id: 'user_2',
      name: 'David Adeleke',
      initials: 'DA',
      role: 'Buyer',
      avatar: null,
      isOnline: true
    },
    product: {
      id: 'prod_2',
      name: 'Samsung Galaxy Buds',
      image: '/src/assets/images/product.png',
      price: 15000
    },
    lastMessage: {
      id: 'msg_2',
      content: 'what colours do you have avai..',
      timestamp: '2024-01-15T17:45:00Z',
      senderId: 'user_2',
      senderName: 'David Adeleke'
    },
    unreadCount: 0,
    updatedAt: '2024-01-15T17:45:00Z',
    conversationType: 'seller_to_buyer' // Current user is seller, chatting with buyer
  },
  {
    id: 'conv_3',
    participant: {
      id: 'user_3',
      name: 'Kemi Johnson',
      initials: 'KJ',
      role: 'Seller',
      avatar: null,
      isOnline: false
    },
    product: {
      id: 'prod_3',
      name: 'MacBook Air M2',
      image: '/src/assets/images/product.png',
      price: 450000
    },
    lastMessage: {
      id: 'msg_3',
      content: 'what colours do you have avai..',
      timestamp: '2024-01-15T16:30:00Z',
      senderId: 'user_3',
      senderName: 'Kemi Johnson'
    },
    unreadCount: 1,
    updatedAt: '2024-01-15T16:30:00Z',
    conversationType: 'buyer_to_seller' // Current user is buyer, chatting with seller
  },
  {
    id: 'conv_4',
    participant: {
      id: 'user_4',
      name: 'Sarah Williams',
      initials: 'SW',
      role: 'Seller',
      avatar: null,
      isOnline: true
    },
    product: {
      id: 'prod_4',
      name: 'iPhone 14 Pro',
      image: '/src/assets/images/product.png',
      price: 320000
    },
    lastMessage: {
      id: 'msg_4',
      content: 'The phone is in perfect condition, barely used',
      timestamp: '2024-01-15T15:20:00Z',
      senderId: 'user_4',
      senderName: 'Sarah Williams'
    },
    unreadCount: 0,
    updatedAt: '2024-01-15T15:20:00Z',
    conversationType: 'seller_to_buyer' // Current user is seller, chatting with buyer
  },
  {
    id: 'conv_5',
    participant: {
      id: 'user_5',
      name: 'Michael Brown',
      initials: 'MB',
      role: 'Buyer',
      avatar: null,
      isOnline: false
    },
    product: {
      id: 'prod_5',
      name: 'Dell Laptop',
      image: '/src/assets/images/product.png',
      price: 180000
    },
    lastMessage: {
      id: 'msg_5',
      content: 'Is the laptop still available?',
      timestamp: '2024-01-15T14:10:00Z',
      senderId: 'user_5',
      senderName: 'Michael Brown'
    },
    unreadCount: 3,
    updatedAt: '2024-01-15T14:10:00Z',
    conversationType: 'seller_to_buyer' // Current user is seller, chatting with buyer
  }
];

// Mock messages for each conversation
const mockMessages = {
  conv_1: [
    {
      id: 'msg_1_1',
      content: 'Yes, the Nike Air Force 1 in White/Black (Size 42) is still available. It\'s in excellent condition.',
      timestamp: '2024-01-15T18:12:00Z',
      senderId: 'user_1',
      senderName: 'Ahmed Okafor',
      isFromCurrentUser: false
    },
    {
      id: 'msg_1_2',
      content: 'Hi! I\'m interested in the Nike Air Force 1 you have listed. Is it still available?',
      timestamp: '2024-01-15T18:16:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    },
    {
      id: 'msg_1_3',
      content: 'Can you tell me more about the condition? Any signs of wear?',
      timestamp: '2024-01-15T18:16:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    }
  ],
  conv_2: [
    {
      id: 'msg_2_1',
      content: 'Hello! I saw your Samsung Galaxy Buds listing. Are they still available?',
      timestamp: '2024-01-15T17:30:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    },
    {
      id: 'msg_2_2',
      content: 'Yes, they are available. What would you like to know about them?',
      timestamp: '2024-01-15T17:35:00Z',
      senderId: 'user_2',
      senderName: 'David Adeleke',
      isFromCurrentUser: false
    },
    {
      id: 'msg_2_3',
      content: 'what colours do you have avai..',
      timestamp: '2024-01-15T17:45:00Z',
      senderId: 'user_2',
      senderName: 'David Adeleke',
      isFromCurrentUser: false
    }
  ],
  conv_4: [
    {
      id: 'msg_4_1',
      content: 'Hi! I\'m interested in your iPhone 14 Pro. Is it still available?',
      timestamp: '2024-01-15T15:15:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    },
    {
      id: 'msg_4_2',
      content: 'The phone is in perfect condition, barely used',
      timestamp: '2024-01-15T15:20:00Z',
      senderId: 'user_4',
      senderName: 'Sarah Williams',
      isFromCurrentUser: false
    }
  ],
  conv_5: [
    {
      id: 'msg_5_1',
      content: 'Is the laptop still available?',
      timestamp: '2024-01-15T14:10:00Z',
      senderId: 'user_5',
      senderName: 'Michael Brown',
      isFromCurrentUser: false
    },
    {
      id: 'msg_5_2',
      content: 'Yes, the Dell Laptop is still available. It\'s in great condition.',
      timestamp: '2024-01-15T14:15:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    },
    {
      id: 'msg_5_3',
      content: 'What are the specifications?',
      timestamp: '2024-01-15T14:20:00Z',
      senderId: 'user_5',
      senderName: 'Michael Brown',
      isFromCurrentUser: false
    },
    {
      id: 'msg_5_4',
      content: 'It has 8GB RAM, 256GB SSD, Intel i5 processor',
      timestamp: '2024-01-15T14:25:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    }
  ],
  conv_3: [
    {
      id: 'msg_3_1',
      content: 'Hi! I\'m interested in your MacBook Air M2. Is it still available?',
      timestamp: '2024-01-15T16:15:00Z',
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    },
    {
      id: 'msg_3_2',
      content: 'Yes, it\'s available. It\'s in excellent condition with minimal usage.',
      timestamp: '2024-01-15T16:20:00Z',
      senderId: 'user_3',
      senderName: 'Kemi Johnson',
      isFromCurrentUser: false
    },
    {
      id: 'msg_3_3',
      content: 'what colours do you have avai..',
      timestamp: '2024-01-15T16:30:00Z',
      senderId: 'user_3',
      senderName: 'Kemi Johnson',
      isFromCurrentUser: false
    }
  ]
};

// Chat service functions
export const chatService = {
  // Get all conversations for the current user based on their role
  getConversations: async (currentUserRole = 'buyer') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter conversations based on current user role
    if (currentUserRole === 'seller') {
      // Sellers see conversations where they are the seller (seller_to_buyer)
      return mockConversations.filter(conv => conv.conversationType === 'seller_to_buyer');
    } else {
      // Buyers (including non-sellers) see conversations where they are the buyer (buyer_to_seller)
      return mockConversations.filter(conv => conv.conversationType === 'buyer_to_seller');
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMessages[conversationId] || [];
  },

  // Send a new message
  sendMessage: async (conversationId, content) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      senderId: 'current_user',
      senderName: 'You',
      isFromCurrentUser: true
    };

    // Add to mock messages
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    // Update conversation's last message
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.lastMessage = {
        id: newMessage.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        senderId: newMessage.senderId,
        senderName: newMessage.senderName
      };
      conversation.updatedAt = newMessage.timestamp;
    }

    return newMessage;
  },

  // Search conversations
  searchConversations: async (query, currentUserRole = 'buyer') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // First filter by user role
    const filteredConversations = currentUserRole === 'seller' 
      ? mockConversations.filter(conv => conv.conversationType === 'seller_to_buyer')
      : mockConversations.filter(conv => conv.conversationType === 'buyer_to_seller');
    
    if (!query.trim()) {
      return filteredConversations;
    }

    return filteredConversations.filter(conv => 
      conv.participant.name.toLowerCase().includes(query.toLowerCase()) ||
      conv.product.name.toLowerCase().includes(query.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get conversation by ID
  getConversation: async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockConversations.find(conv => conv.id === conversationId);
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
    return true;
  }
};

export default chatService;
