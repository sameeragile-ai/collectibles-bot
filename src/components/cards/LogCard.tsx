import React, { useState } from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { Terminal, Copy, Check, Filter } from 'lucide-react';

export const LogCard: React.FC = () => {
  const { logs } = useDroplineStore();
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'DETECT' | 'CART' | 'SUCCESS' | 'ERROR'>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((l) => (filter === 'ALL' ? true : l.level === filter));

  const handleCopy = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-emerald-400 font-semibold';
      case 'ERROR':
        return 'text-rose-400 font-semibold';
      case 'CART':
        return 'text-sky-300';
      case 'DETECT':
        return 'text-amber-300';
      case 'CHECKOUT':
        return 'text-purple-300';
      default:
        return 'text-stone-400';
    }
  };

  return (
    <div className="w-full max-w-xl bg-stone-950 border border-stone-800 text-stone-200 rounded-2xl p-4 shadow-md font-mono text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-100 text-xs">Dropline Execution Logs</span>
          <span className="text-[10px] text-stone-500 tabular-nums">({filteredLogs.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-stone-800"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
        {(['ALL', 'INFO', 'DETECT', 'CART', 'SUCCESS', 'ERROR'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              filter === tab
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Monospace Log Lines */}
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-stone-800">
        {filteredLogs.length === 0 ? (
          <div className="text-stone-600 text-center py-4">No log records matching filter.</div>
        ) : (
          filteredLogs.slice(0, 40).map((log) => (
            <div
              key={log.id}
              className="leading-relaxed hover:bg-stone-900/60 px-1.5 py-0.5 rounded transition-colors flex items-start gap-2"
            >
              <span className="text-stone-600 select-none shrink-0 text-[10px]">
                {log.timestamp}
              </span>
              <span className={`shrink-0 text-[10px] ${getLevelBadgeColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-stone-300 break-all flex-1 text-[11px]">
                {log.message}
              </span>
              {log.msDelta !== undefined && (
                <span className="text-stone-500 shrink-0 text-[10px]">
                  +{log.msDelta}ms
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
