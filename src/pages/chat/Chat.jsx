import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatProvider, useChat } from '../../contexts/ChatContext';
import { ChatList, ChatWindow } from '../../components/chat';

const ChatContent = () => {
  const { user } = useAuth();
  const { selectedConversationId, setSelectedConversationId } = useChat();
  const [showChatWindow, setShowChatWindow] = useState(false);

  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    setShowChatWindow(true);
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
  };

  return (
    <div className="h-[calc(100vh-5rem)] bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200">
          <ChatList 
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
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
