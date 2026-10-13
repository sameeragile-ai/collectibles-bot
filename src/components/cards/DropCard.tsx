import React, { useState } from 'react';
import { DropItem } from '../../types';
import { useDroplineStore } from '../../store/useDroplineStore';
import { Clock, Plus, Zap, ArrowUpRight, Package } from 'lucide-react';

interface DropCardProps {
  drop: DropItem;
}

export const DropCard: React.FC<DropCardProps> = ({ drop }) => {
  const [imageError, setImageError] = useState(false);
  const { createTask, activeConversationId, addMessage, profiles } = useDroplineStore();

  const handleSetupTask = () => {
    const defaultProfile = profiles.find((p) => p.isDefault) || profiles[0];
    const newTask = {
      productId: drop.id,
      productName: drop.name,
      storeName: drop.storeName,
      variant: drop.sizes ? drop.sizes[0] : 'One Size',
      quantity: 1,
      maxPrice: Math.round(drop.retailPrice * 1.2),
      profileId: defaultProfile?.id || 'prof-home',
      profileName: defaultProfile?.name || 'Home (Primary)',
      status: 'idle' as const,
      dropTime: drop.dropTime,
      retries: 3,
    };

    if (activeConversationId) {
      addMessage(activeConversationId, {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: `Configured task preview for ${drop.name}. Confirm your parameters to activate:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cardType: 'task_preview',
        cardData: {
          task: {
            ...newTask,
            id: 'task-' + Date.now(),
          },
          isConfirmed: false,
        },
      });
    } else {
      createTask(newTask);
    }
  };

  const estProfit = drop.estResalePrice - drop.retailPrice;

  return (
    <div className="w-64 shrink-0 bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Product Image with Fallback */}
      <div className="relative h-36 bg-gradient-to-tr from-stone-100 via-rose-50/30 to-sky-50/40 overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={drop.imageUrl}
            alt={drop.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
            <Package className="w-8 h-8 text-stone-400" />
            <span className="text-[11px] font-medium text-stone-500">{drop.brand}</span>
          </div>
        )}

        {/* Store & Demand tags */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px]">
          <span className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full font-medium text-stone-800 shadow-xs border border-white/40">
            {drop.storeName}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold shadow-xs ${
              drop.demand === 'Extreme'
                ? 'bg-rose-500/90 text-white'
                : drop.demand === 'High'
                ? 'bg-amber-500/90 text-white'
                : 'bg-stone-700/80 text-white'
            }`}
          >
            {drop.demand}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <span className="text-[11px] text-stone-500 block truncate">{drop.brand}</span>
          <h4 className="text-xs font-bold text-stone-900 tracking-tight line-clamp-1 mt-0.5">
            {drop.name}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{drop.dropDateDisplay}</span>
          </div>
        </div>

        {/* Price & Spread */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-stone-500 block">Retail</span>
            <span className="font-bold text-stone-900 font-mono tabular-nums">
              ${drop.retailPrice}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-600 font-medium block">Est. Resale</span>
            <span className="font-bold text-emerald-700 font-mono tabular-nums">
              ${drop.estResalePrice}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSetupTask}
          className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 text-rose-300" />
          Set up task
        </button>
      </div>
    </div>
  );
};
