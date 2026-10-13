import React from 'react';
import { BotTask } from '../../types';
import { useDroplineStore } from '../../store/useDroplineStore';
import { runTaskSimulation } from '../../lib/simulator/engine';
import {
  Activity,
  Pause,
  Play,
  Clock,
  Shield,
  Zap,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

interface StatusCardProps {
  task?: BotTask;
  isAll?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ task, isAll }) => {
  const { tasks, pauseTask, resumeTask, deleteTask, stopAllTasks, resumeAllTasks } =
    useDroplineStore();

  const currentTask = task || tasks[0];

  if (!currentTask) {
    return (
      <div className="p-4 bg-white border border-stone-200 rounded-xl text-xs text-stone-500">
        No active tasks configured yet.
      </div>
    );
  }

  const isPaused = currentTask.status === 'paused';
  const isMonitoring = currentTask.status === 'monitoring';

  return (
    <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isMonitoring
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : isPaused
                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                : 'bg-stone-100 text-stone-700 border border-stone-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 tracking-tight">
              {currentTask.productName}
            </h4>
            <span className="text-[11px] text-stone-500">
              {currentTask.storeName} · {currentTask.variant}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              isMonitoring
                ? 'bg-emerald-100 text-emerald-800'
                : isPaused
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {currentTask.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
          <span className="text-[10px] text-stone-500 block">Proxy Latency</span>
          <span className="font-semibold text-stone-900 font-mono tabular-nums">38 ms</span>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
          <span className="text-[10px] text-stone-500 block">Profile</span>
          <span className="font-semibold text-stone-900 truncate block">
            {currentTask.profileName}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100">
          <span className="text-[10px] text-stone-500 block">Queue Delay</span>
          <span className="font-semibold text-stone-900 font-mono tabular-nums">110 ms</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {isPaused ? (
            <button
              onClick={() => resumeTask(currentTask.id)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Play className="w-3 h-3 fill-white" />
              Resume Monitoring
            </button>
          ) : (
            <button
              onClick={() => pauseTask(currentTask.id)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1.5 hover:bg-stone-200 transition-colors"
            >
              <Pause className="w-3 h-3" />
              Pause Task
            </button>
          )}

          <button
            onClick={() => deleteTask(currentTask.id)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => runTaskSimulation({ taskId: currentTask.id })}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-95 transition-all shadow-xs active:scale-95"
        >
          <Zap className="w-3 h-3 fill-white" />
          Run Simulation
        </button>
      </div>
    </div>
  );
};
