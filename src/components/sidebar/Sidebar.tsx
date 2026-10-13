import React from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { handleUserMessage } from '../../lib/ai/chatHandler';
import {
  Plus,
  MessageSquare,
  Package,
  Activity,
  User,
  Store,
  BarChart3,
  Terminal,
  Zap,
  Trash2,
  X,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    conversations,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    tasks,
    drops,
  } = useDroplineStore();

  if (!sidebarOpen) return null;

  const handleQuickAction = (actionPrompt: string) => {
    handleUserMessage(actionPrompt);
  };

  return (
    <aside className="w-72 lg:w-76 border-r border-stone-200/80 bg-white/95 backdrop-blur-md flex flex-col h-full shrink-0 z-20 shadow-sm transition-all">
      {/* Brand Header */}
      <div className="h-14 border-b border-stone-200/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FFB4A2] via-[#F78FB3] to-[#74B9FF] text-white flex items-center justify-center shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-stone-900 font-sans">
            Dropline
          </span>
          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {/* New Session Button */}
        <button
          onClick={() => createNewConversation()}
          className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 text-rose-300" />
          New Drop Session
        </button>

        {/* Quick Tools Section */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
            Quick Actions
          </span>
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => handleQuickAction("What's dropping this week?")}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-stone-500" />
                <span>Upcoming Drops</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">{drops.length}</span>
            </button>

            <button
              onClick={() => handleQuickAction('Check my active tasks')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-stone-500" />
                <span>Active Tasks</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                {tasks.filter((t) => t.status === 'monitoring').length} armed
              </span>
            </button>

            <button
              onClick={() => handleQuickAction('Show my shipping profiles')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Profiles & Cards</span>
            </button>

            <button
              onClick={() => handleQuickAction('Show me my results this month')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Analytics & ROI</span>
            </button>

            <button
              onClick={() => handleQuickAction('Show logs for the last drop')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-stone-500" />
              <span>Raw Drop Logs</span>
            </button>
          </div>
        </div>

        {/* Conversations History */}
        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
            Sessions
          </span>
          <div className="space-y-1 pt-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group w-full text-left px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-start justify-between ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 font-medium'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0 pr-1">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400 group-hover:text-stone-600" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold leading-tight">{conv.title}</p>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">{conv.snippet}</p>
                    </div>
                  </div>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-stone-200/80 bg-stone-50/60 shrink-0 text-xs">
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span className="font-medium text-stone-700">Engine Online</span>
          </div>
          <span className="font-mono text-stone-400">Toronto Node 1</span>
        </div>
      </div>
    </aside>
  );
};
