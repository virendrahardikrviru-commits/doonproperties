
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext.jsx';
import MessageBubble from './MessageBubble.jsx';
import QuickReplies from './QuickReplies.jsx';
import MessageInput from './MessageInput.jsx';

const ConversationPanel = () => {
  const { chats, messages, activeChatId, setActiveChatId, markMessagesAsRead } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const chatMessages = messages[activeChatId] || [];

  useEffect(() => {
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId, markMessagesAsRead, chatMessages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  if (!activeChat) {
    return (
      <div className="hidden md:flex h-full w-full flex-col items-center justify-center bg-gray-50/50 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">Your Messages</h3>
        <p className="text-muted-foreground mt-2">Select a conversation from the sidebar to start chatting.</p>
      </div>
    );
  }

  const handleQuickReply = (text) => {
    setInputValue((prev) => prev ? `${prev} ${text}` : text);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative z-10">
      {/* Header */}
      <div className="flex items-center px-4 sm:px-6 py-4 bg-white border-b border-[hsl(var(--chat-border-light))] z-10">
        <button 
          onClick={() => setActiveChatId(null)}
          className="md:hidden mr-3 p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Back to chat list"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
          {activeChat.seller_avatar}
        </div>
        
        <div className="ml-3 sm:ml-4 flex flex-col min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{activeChat.seller_name}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{activeChat.property_title}</p>
        </div>
        
        <div className="ml-3 flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted">
          <img src={activeChat.property_image} alt="Property" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isConsecutive = idx > 0 && chatMessages[idx - 1].sender_id === msg.sender_id;
            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isConsecutive={isConsecutive} 
              />
            );
          })
        )}
        <div ref={messagesEndRef} className="pt-2" />
      </div>

      {/* Input Area */}
      <div className="bg-white flex-shrink-0">
        <QuickReplies onSelect={handleQuickReply} />
        <MessageInput 
          chatId={activeChat.id} 
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
};

export default ConversationPanel;
