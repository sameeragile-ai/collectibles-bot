import React, { useRef } from 'react';
import { DropItem } from '../../types';
import { DropCard } from './DropCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface DropsGridCardProps {
  drops?: DropItem[];
}

export const DropsGridCard: React.FC<DropsGridCardProps> = ({ drops }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!drops || drops.length === 0) return null;

  return (
    <div className="w-full max-w-2xl space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
          <span>Weekly Drops Schedule</span>
          <span className="text-stone-400 font-normal">({drops.length} items)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors shadow-2xs hover:bg-stone-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors shadow-2xs hover:bg-stone-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
      >
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
};
