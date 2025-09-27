// Chat utility functions for consistent chat identification

/**
 * Generate a consistent chat key for two users
 * This ensures the same key regardless of who initiates the chat
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} - Consistent chat key
 */
export const generateChatKey = (userId1, userId2) => {
  if (!userId1 || !userId2) {
    throw new Error('Both userId1 and userId2 are required');
  }
  
  // Sort IDs to ensure consistent key regardless of order
  return [userId1, userId2].sort().join("_");
};

/**
 * Check if a chat exists between current user and target user
 * @param {string} targetUserId - The user ID to check chat with
 * @returns {Promise<string|null>} - Chat ID if exists, null if not
 */
export const checkChatExists = async (targetUserId) => {
  try {
    const { chatApiService } = await import('../services/chatApiService');
    const chat = await chatApiService.getChatWithUser(targetUserId);
    return chat ? chat.id : null;
  } catch (error) {
    console.log('🔍 No existing chat found with user:', targetUserId);
    return null; // Chat doesn't exist
  }
};

/**
 * Find existing chat in loaded conversations
 * @param {Array} conversations - Array of loaded conversations
 * @param {string} targetUserId - The user ID to find chat with
 * @returns {Object|null} - Existing conversation if found, null if not
 */
export const findExistingChat = (conversations, targetUserId) => {
  return conversations.find(conv => {
    // Check if this is a regular chat (not order-type)
    if (conv.type === 'order') return false;
    
    // Check if the participant is the target user
    return conv.participant.id === targetUserId;
  });
};
