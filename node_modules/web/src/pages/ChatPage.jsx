
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext.jsx';
import ChatSidebar from '@/components/ChatSidebar.jsx';
import ConversationPanel from '@/components/ConversationPanel.jsx';
import { cn } from '@/lib/utils.js';

const ChatPage = () => {
  const { activeChatId, setActiveChatId } = useChat();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setActiveChatId(id);
    }
  }, [searchParams, setActiveChatId]);

  return (
    <>
      <Helmet>
        <title>Messages - Dehradun Estates</title>
      </Helmet>

      {/* Account for fixed header height 72px */}
      <div className="h-[calc(100vh-72px)] mt-[72px] w-full flex bg-gray-50 overflow-hidden">
        
        {/* Sidebar Container: Full width on mobile if no active chat, approx 30% on desktop */}
        <div 
          className={cn(
            "h-full transition-all duration-300 ease-in-out flex-shrink-0",
            activeChatId 
              ? "hidden md:block md:w-[320px] lg:w-[380px]" 
              : "w-full md:w-[320px] lg:w-[380px]"
          )}
        >
          <ChatSidebar />
        </div>

        {/* Conversation Container: Hidden on mobile if no active chat, fills remaining space on desktop */}
        <div 
          className={cn(
            "h-full flex-1 min-w-0 transition-all duration-300 ease-in-out",
            !activeChatId && "hidden md:block"
          )}
        >
          <ConversationPanel />
        </div>
        
      </div>
    </>
  );
};

export default ChatPage;
