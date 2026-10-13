import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Command,
  Package,
  Activity,
  User,
  BarChart3,
  Terminal,
  Store,
  Plus,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
}

interface CommandItem {
  cmd: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COMMANDS: CommandItem[] = [
  { cmd: '/drops', label: 'Upcoming Drops', desc: 'Browse weekly drops catalog', icon: Package },
  { cmd: '/task', label: 'Create Task', desc: 'Arm an automated purchase bot', icon: Plus },
  { cmd: '/status', label: 'Task Status', desc: 'Check active drop monitors', icon: Activity },
  { cmd: '/profiles', label: 'Shipping Profiles', desc: 'Manage addresses & payment', icon: User },
  { cmd: '/stats', label: 'Analytics', desc: 'Monthly checkout performance & ROI', icon: BarChart3 },
  { cmd: '/logs', label: 'Execution Logs', desc: 'Raw proxy & websocket logs', icon: Terminal },
];

const SUGGESTIONS = [
  "What's dropping this week?",
  'Buy 2 of the Neon Dragon card box when it drops tomorrow at 9am, max $180 each, use my home profile',
  'Show me my results this month',
  'Show logs for the last drop',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  showSuggestions = false,
}) => {
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [input]);

  // Open menu if starts with '/'
  useEffect(() => {
    if (input.startsWith('/')) {
      setShowMenu(true);
      setSelectedIndex(0);
    } else {
      setShowMenu(false);
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInput('');
    setShowMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % COMMANDS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + COMMANDS.length) % COMMANDS.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = COMMANDS[selectedIndex];
        setInput(selected.cmd + ' ');
        setShowMenu(false);
        return;
      }
      if (e.key === 'Escape') {
        setShowMenu(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectCommand = (cmd: string) => {
    setInput(cmd + ' ');
    setShowMenu(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 space-y-2 relative">
      {/* Suggested Prompt Chips */}
      {showSuggestions && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSendMessage(suggestion)}
              className="text-[11px] font-medium text-stone-600 bg-white/90 hover:bg-white border border-stone-200/80 hover:border-stone-300 px-3 py-1.5 rounded-full shadow-2xs whitespace-nowrap transition-all active:scale-98 shrink-0 hover:text-stone-900"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Slash Command Animated Popover */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-4 right-4 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl p-1.5 z-30 max-h-60 overflow-y-auto space-y-0.5"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Quick Slash Commands
            </div>
            {COMMANDS.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.cmd}
                  onClick={() => handleSelectCommand(item.cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    isSelected ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-stone-200/60 text-stone-700 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 mr-2">{item.cmd}</span>
                      <span className="text-stone-500 text-[11px]">{item.label}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Input Box */}
      <div className="relative bg-white border border-stone-200/90 rounded-2xl shadow-md p-2 flex items-end gap-2 focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200/60 transition-all">
        {/* Command trigger helper button */}
        <button
          type="button"
          onClick={() => {
            setInput('/');
            textareaRef.current?.focus();
          }}
          className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors shrink-0"
          title="Slash Commands"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Dropline... (e.g. 'Watch the Midnight Bear figure drop Friday at 10am' or type /)"
          rows={1}
          className="w-full resize-none bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 py-1.5 focus:outline-none max-h-36 leading-relaxed"
        />

        {/* Send Button with press scale and subtle accent gradient */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`p-2.5 rounded-xl shrink-0 transition-all shadow-xs flex items-center justify-center ${
            input.trim() && !disabled
              ? 'bg-gradient-to-tr from-[#FFB4A2] via-[#F78FB3] to-[#74B9FF] text-white hover:opacity-95 shadow-rose-500/20 active:scale-95'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between px-2 text-[10px] text-stone-400">
        <span>Press <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-200">Enter</kbd> to send, <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-200">Shift+Enter</kbd> for new line</span>
        <span>Type <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-200">/</kbd> for quick tools</span>
      </div>
    </div>
  );
};
