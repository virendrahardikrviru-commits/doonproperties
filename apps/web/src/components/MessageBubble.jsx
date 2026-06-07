
import React from 'react';
import { cn } from '@/lib/utils.js';

const MessageBubble = ({ message, isConsecutive }) => {
  const isMe = message.sender_id === 'me';

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={cn(
        "flex w-full animate-message-fade-in", 
        isMe ? "justify-end" : "justify-start",
        isConsecutive ? "mt-1.5" : "mt-4"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-4 py-3 flex flex-col gap-1 relative",
          isMe 
            ? "chat-bubble-sent rounded-[16px] rounded-tr-sm" 
            : "chat-bubble-received rounded-[16px] rounded-tl-sm shadow-sm"
        )}
      >
        <p className={cn("text-[14px] md:text-[15px] leading-relaxed", isMe ? "text-[hsl(var(--chat-bubble-sent-fg))]" : "text-foreground")}>
          {message.text}
        </p>
        <span 
          className={cn(
            "text-[10px] md:text-[11px] font-medium text-right mt-1 opacity-70",
            isMe ? "text-[hsl(var(--chat-bubble-sent-fg))]" : "text-muted-foreground"
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
