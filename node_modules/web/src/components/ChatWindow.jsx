
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ChatWindow = ({ isOpen, onClose, sellerName }) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'seller',
      text: 'Hi there! Feel free to ask me any questions about the property.',
      timestamp: new Date().toISOString()
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    // Simulate seller reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'seller',
          text: 'Thank you for reaching out. I will get back to you shortly!',
          timestamp: new Date().toISOString()
        }
      ]);
    }, 1500);
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="chat-window fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full h-[65vh] sm:w-[380px] sm:h-[500px] sm:rounded-2xl rounded-t-2xl rounded-b-none"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold leading-tight">Chat with {sellerName}</span>
                <span className="text-xs text-primary-foreground/80 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-muted/30 p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-white border border-border text-foreground rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:border-primary px-4"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full w-10 h-10 flex-shrink-0 bg-primary hover:bg-primary/90"
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWindow;
