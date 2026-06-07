
import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { useChat } from '@/contexts/ChatContext.jsx';

const ChatSidebar = () => {
  const { chats, activeChatId, setActiveChatId, searchQuery, setSearchQuery } = useChat();

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-[hsl(var(--chat-border-light))] z-20">
      
      {/* Sidebar Header & Search */}
      <div className="p-4 sm:p-5 border-b border-[hsl(var(--chat-border-light))]">
        <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200 text-foreground"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No chats found." : "You have no messages yet."}
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isUnread = chat.unread_count > 0;

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "w-full flex items-start gap-3 sm:gap-4 p-4 text-left transition-colors duration-200 border-b border-[hsl(var(--chat-border-light))] relative",
                  isActive 
                    ? "bg-[hsl(var(--chat-sidebar-active))] border-l-4 border-l-primary" 
                    : "hover:bg-[hsl(var(--chat-sidebar-hover))] border-l-4 border-l-transparent"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-muted">
                    <img src={chat.property_image} alt={chat.property_title} className="w-full h-full object-cover" />
                  </div>
                  {isUnread && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn("text-[15px] truncate pr-2", isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90")}>
                      {chat.seller_name}
                    </h3>
                    <span className={cn("text-xs whitespace-nowrap", isUnread ? "font-bold text-primary" : "font-medium text-muted-foreground")}>
                      {formatTime(chat.updated_at)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {chat.property_title}
                  </p>
                  
                  <p className={cn("text-[13px] truncate", isUnread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {chat.last_message || "Started a conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
