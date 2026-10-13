import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-stone-200/70 rounded-2xl shadow-xs w-fit">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0 }}
        className="w-1.5 h-1.5 rounded-full bg-stone-500"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0.2 }}
        className="w-1.5 h-1.5 rounded-full bg-stone-500"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0.4 }}
        className="w-1.5 h-1.5 rounded-full bg-stone-500"
      />
    </div>
  );
};
