import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatProvider, useChat } from '../../contexts/ChatContext';
import { ChatList, ChatWindow } from '../../components/chat';
import { useSearchParams } from 'react-router-dom';

const ChatContent = () => {
  const { user } = useAuth();
  const { selectedConversationId, setSelectedConversationId, conversations, markAsRead } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId');

  const handleConversationSelect = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setShowChatWindow(true);
    
    // Mark messages as read when conversation is selected (only for real chat IDs, not seller-* IDs)
    if (conversationId && !conversationId.startsWith('seller-')) {
      try {
        await markAsRead(conversationId);
      } catch (error) {
      }
    }
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
  };

  // Auto-select conversation with seller if sellerId is provided
  useEffect(() => {
    if (sellerId) {
      // Look for existing conversation with this seller
      const existingConversation = conversations.find(conv => 
        conv.participant.id === sellerId
      );
      
      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
        setShowChatWindow(true);
      } else if (conversations.length === 0) {
        // If no conversations exist yet, we'll create one when user sends first message
        // For now, just show the chat window
        setShowChatWindow(true);
      }
    }
  }, [sellerId, conversations]);

  return (
    <div className="h-full overflow-hidden" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        {/* Chat List Sidebar */}
        <div className="chat-sidebar-desktop w-80 flex-shrink-0 border-r border-gray-200 h-full" style={{ backgroundColor: '#F7F5F0' }}>
          <ChatList 
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 h-full" style={{ backgroundColor: '#F7F5F0' }}>
          <ChatWindow 
            conversationId={selectedConversationId}
            currentUser={user}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full">
        {!showChatWindow ? (
          /* Mobile Chat List - Full Screen */
          <div className="h-full">
            <ChatList 
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversationId}
            />
          </div>
        ) : (
          /* Mobile Chat Window - Full Screen */
          <div className="h-full">
            <ChatWindow 
              conversationId={selectedConversationId}
              currentUser={user}
              onBackToList={handleBackToList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
