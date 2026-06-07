
import React from 'react';
import { Send } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext.jsx';

const MessageInput = ({ chatId, inputValue, setInputValue }) => {
  const { addMessage } = useChat();

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage(chatId, inputValue.trim(), 'me');
    setInputValue('');
  };

  return (
    <div className="p-4 sm:p-5 bg-white border-t border-[hsl(var(--chat-border-light))]">
      <form onSubmit={handleSend} className="flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-foreground transition-all duration-200 outline-none"
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim()}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-[0.96]"
          aria-label="Send message"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
