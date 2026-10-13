import React, { useRef, useEffect } from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { handleUserMessage } from '../../lib/ai/chatHandler';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Radio,
  Sparkles,
  ShoppingBag,
  Zap,
} from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    toggleSidebar,
    liveBoardOpen,
    toggleLiveBoard,
    tasks,
  } = useDroplineStore();

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConv?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeTasksCount = tasks.filter((t) => t.status === 'monitoring').length;

  const onSendMessage = (text: string) => {
    handleUserMessage(text);
  };

  const isStreamingAny = messages.some((m) => m.isStreaming && !m.text);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAF9] overflow-hidden relative">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-stone-900 tracking-tight">
              {activeConv?.title || 'Drop Assistant Session'}
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
              <span aria-hidden="true">·</span>
              <span>{activeTasksCount} active task(s)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Chip */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200/80 text-[11px] font-mono text-stone-600">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Proxy Pool: 38ms</span>
          </div>

          <button
            onClick={toggleLiveBoard}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
              liveBoardOpen
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title={liveBoardOpen ? 'Hide Live Board' : 'Show Live Board'}
          >
            <span className="hidden sm:inline">Live Board</span>
            {liveBoardOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4 relative">
            {/* Subtle warm mesh glow behind empty state */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#FFB4A2]/20 via-[#F78FB3]/15 to-[#74B9FF]/20 blur-3xl pointer-events-none -z-10" />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFB4A2] via-[#F78FB3] to-[#74B9FF] text-white flex items-center justify-center shadow-lg shadow-rose-500/15 mb-4">
              <Zap className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-stone-900 tracking-tight">
              Dropline
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed text-balance">
              Automated drop execution assistant. Conversational checkout at sub-second speeds.
            </p>

            <div className="mt-8 w-full space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Quick Prompts
              </span>
              <div className="grid grid-cols-1 gap-2 text-left">
                {[
                  "What's dropping this week?",
                  'Buy 2 of the Neon Dragon card box when it drops tomorrow at 9am, max $180 each, use my home profile',
                  'Show me my results this month',
                  'Show logs for the last drop',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSendMessage(prompt)}
                    className="p-3 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 text-xs text-stone-700 hover:text-stone-900 shadow-2xs transition-all hover:shadow-xs active:scale-98 flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isStreamingAny && (
              <div className="pl-9.5">
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      <div className="shrink-0 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9] to-transparent pt-3">
        <ChatInput
          onSendMessage={onSendMessage}
          showSuggestions={messages.length === 0}
        />
      </div>
    </div>
  );
};
