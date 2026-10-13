import React, { useState, useEffect } from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { runTaskSimulation } from '../../lib/simulator/engine';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Play,
  Pause,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Radio,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

export const LiveBoard: React.FC = () => {
  const {
    tasks,
    history,
    liveBoardOpen,
    setLiveBoardOpen,
    pauseTask,
    resumeTask,
    runningTaskId,
  } = useDroplineStore();

  // Next drop countdown calculation
  const [timeLeft, setTimeLeft] = useState<{ m: number; s: number }>({ m: 13, s: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        return { m: 14, s: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSpent = history.reduce((acc, h) => (h.status === 'secured' ? acc + h.retailPrice : acc), 0);
  const totalValue = history.reduce((acc, h) => (h.status === 'secured' ? acc + h.resalePrice : acc), 0);
  const securedCount = history.filter((h) => h.status === 'secured').length;
  const totalCount = history.length;
  const successRate = totalCount > 0 ? ((securedCount / totalCount) * 100).toFixed(0) : '94';

  if (!liveBoardOpen) return null;

  return (
    <aside className="w-80 lg:w-88 border-l border-stone-200/80 bg-white/95 backdrop-blur-md flex flex-col h-full shrink-0 z-20 shadow-sm transition-all">
      {/* Header */}
      <div className="h-14 border-b border-stone-200/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-bold text-stone-900 tracking-tight uppercase">
            Live Board
          </h3>
        </div>
        <button
          onClick={() => setLiveBoardOpen(false)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Close Live Board"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* Next Drop Countdown Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-900 text-white shadow-md space-y-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              Next Drop Launch
            </span>
            <span className="text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
              T-Minus
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-tight truncate">
            Midnight Bear Vinyl Figure
          </h4>

          {/* Sliding Tabular Numbers */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-baseline gap-1 bg-stone-950/70 border border-stone-700/60 px-3 py-1.5 rounded-xl font-mono">
              <span className="text-2xl font-bold tabular-nums text-white">
                {String(timeLeft.m).padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-400">m</span>
            </div>
            <span className="text-stone-500 font-bold">:</span>
            <div className="flex items-baseline gap-1 bg-stone-950/70 border border-stone-700/60 px-3 py-1.5 rounded-xl font-mono">
              <span className="text-2xl font-bold tabular-nums text-rose-400">
                {String(timeLeft.s).padStart(2, '0')}
              </span>
              <span className="text-xs text-stone-400">s</span>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => {
                  const target = tasks.find((t) => t.productName.includes('Midnight Bear')) || tasks[0];
                  if (target) runTaskSimulation({ taskId: target.id });
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                title="Trigger drop simulation right now"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                Simulate
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
            <span className="text-[10px] text-stone-500 block">Bot Win Rate</span>
            <span className="text-base font-bold text-stone-900 font-mono tabular-nums">
              {successRate}%
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block">
              {securedCount} items secured
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
            <span className="text-[10px] text-stone-500 block">Est. Net Profit</span>
            <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
              +${(totalValue - totalSpent).toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 font-mono block">
              Avg 412ms checkout
            </span>
          </div>
        </div>

        {/* Active Tasks List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Monitored Tasks ({tasks.length})
            </h4>
            <span className="text-[11px] text-stone-400 font-mono">120ms poll</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {tasks.map((task) => {
                const isRunning = runningTaskId === task.id;
                const isMonitoring = task.status === 'monitoring';
                const isPaused = task.status === 'paused';
                const isSecured = task.status === 'secured';

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-xl border text-xs transition-all relative overflow-hidden ${
                      isRunning
                        ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-100'
                        : isSecured
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isPaused
                        ? 'bg-stone-50/50 border-stone-200 opacity-70'
                        : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-semibold text-stone-900 tracking-tight line-clamp-1">
                          {task.productName}
                        </h5>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {task.storeName} · {task.variant}
                        </p>
                      </div>

                      {/* Status indicator pill */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 flex items-center gap-1 ${
                          isRunning
                            ? 'bg-purple-100 text-purple-800 animate-pulse'
                            : isSecured
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMonitoring
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPaused
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <Activity className="w-2.5 h-2.5 animate-spin" />
                            Executing
                          </>
                        ) : isSecured ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Secured
                          </>
                        ) : (
                          task.status
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-stone-100 text-[11px]">
                      <div className="text-stone-500 font-mono tabular-nums">
                        ${task.maxPrice} max · Qty {task.quantity}
                      </div>

                      <div className="flex items-center gap-1">
                        {isPaused ? (
                          <button
                            onClick={() => resumeTask(task.id)}
                            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                            title="Resume Task"
                          >
                            <Play className="w-3 h-3 fill-stone-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => pauseTask(task.id)}
                            className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                            title="Pause Task"
                          >
                            <Pause className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => runTaskSimulation({ taskId: task.id })}
                          disabled={isRunning}
                          className="px-2 py-0.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors text-[10px] font-semibold flex items-center gap-1"
                          title="Simulate immediate drop"
                        >
                          <Zap className="w-2.5 h-2.5 text-rose-300" />
                          Run
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </aside>
  );
};
