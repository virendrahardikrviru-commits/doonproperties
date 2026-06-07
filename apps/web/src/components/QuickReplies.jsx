
import React from 'react';
import { motion } from 'framer-motion';

const PREDEFINED_REPLIES = [
  "Is it still available?",
  "What's the best time to visit?",
  "Can you provide more photos?",
  "What are the nearby amenities?",
  "Is negotiation possible?",
  "When can I schedule a viewing?",
  "What's the lease term?",
  "Are utilities included?"
];

const QuickReplies = ({ onSelect }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-3 px-4 sm:px-6 bg-white border-t border-[hsl(var(--chat-border-light))] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="flex gap-2 w-max">
        {PREDEFINED_REPLIES.map((reply, index) => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={index}
            onClick={() => onSelect(reply)}
            className="whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-medium bg-white text-foreground border border-[hsl(var(--chat-border-light))] hover:bg-[hsl(var(--chat-sidebar-active))] hover:border-primary hover:text-primary transition-colors duration-200"
          >
            {reply}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
