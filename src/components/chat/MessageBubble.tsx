import React from 'react';
import { ChatMessage } from '../../types';
import { motion } from 'motion/react';
import { TaskPreviewCard } from '../cards/TaskPreviewCard';
import { TaskRunCard } from '../cards/TaskRunCard';
import { DropsGridCard } from '../cards/DropsGridCard';
import { StatusCard } from '../cards/StatusCard';
import { ProfileCard } from '../cards/ProfileCard';
import { StoreConnectCard } from '../cards/StoreConnectCard';
import { StatsCard } from '../cards/StatsCard';
import { LogCard } from '../cards/LogCard';
import { useDroplineStore } from '../../store/useDroplineStore';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { drops } = useDroplineStore();
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full space-y-2`}
    >
      {/* Bubble Container */}
      <div className={`flex items-start gap-2.5 max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Mark */}
        <div
          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs mt-0.5 select-none ${
            isUser
              ? 'bg-stone-200/80 text-stone-700'
              : 'bg-gradient-to-tr from-[#FFB4A2] via-[#F78FB3] to-[#74B9FF] text-white shadow-xs'
          }`}
        >
          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
        </div>

        {/* Bubble Body */}
        <div className="space-y-1.5 max-w-[calc(100%-2.5rem)]">
          {message.text && (
            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                isUser
                  ? 'bg-gradient-to-r from-rose-100/70 via-purple-100/60 to-sky-100/70 text-stone-900 border border-rose-200/40 shadow-xs'
                  : 'bg-white border border-stone-200/80 text-stone-900 shadow-sm'
              }`}
            >
              <div className="font-normal text-stone-900">
                {message.text}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-stone-700 ml-1 translate-y-0.5 animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-[10px] text-stone-400 font-mono tabular-nums px-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp}
          </div>
        </div>
      </div>

      {/* Rich Card Attachment for Assistant */}
      {!isUser && message.cardType && (
        <div className="pl-9.5 w-full pt-1">
          {message.cardType === 'task_preview' && message.cardData?.task && (
            <TaskPreviewCard
              task={message.cardData.task}
              isConfirmed={message.cardData.isConfirmed}
            />
          )}

          {message.cardType === 'task_run' && message.cardData?.task && (
            <TaskRunCard task={message.cardData.task} />
          )}

          {message.cardType === 'drops_list' && (
            <DropsGridCard drops={message.cardData?.drops || drops} />
          )}

          {message.cardType === 'task_status' && (
            <StatusCard task={message.cardData?.task} isAll={message.cardData?.isAll} />
          )}

          {message.cardType === 'profile_form' && <ProfileCard mode="form" />}

          {message.cardType === 'profiles_list' && <ProfileCard mode="list" />}

          {message.cardType === 'store_connect' && (
            <StoreConnectCard
              url={message.cardData?.url}
              name={message.cardData?.name}
            />
          )}

          {message.cardType === 'analytics' && <StatsCard />}

          {message.cardType === 'logs' && <LogCard />}
        </div>
      )}
    </motion.div>
  );
};
