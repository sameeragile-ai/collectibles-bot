import React, { useState } from 'react';
import { BotTask } from '../../types';
import { useDroplineStore } from '../../store/useDroplineStore';
import { runTaskSimulation } from '../../lib/simulator/engine';
import { Check, Edit3, Play, Clock, ShieldCheck, ShoppingBag, Store, Tag } from 'lucide-react';

interface TaskPreviewCardProps {
  task: BotTask;
  isConfirmed?: boolean;
}

export const TaskPreviewCard: React.FC<TaskPreviewCardProps> = ({
  task: initialTask,
  isConfirmed = false,
}) => {
  const { createTask, updateTask, profiles } = useDroplineStore();
  const [task, setTask] = useState<BotTask>(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmed, setConfirmed] = useState(isConfirmed);

  const handleConfirm = () => {
    const created = createTask({
      ...task,
      status: 'monitoring',
    });
    setTask(created);
    setConfirmed(true);
  };

  const handleRunSimulation = () => {
    // If not yet created, create first
    if (!confirmed) {
      handleConfirm();
    }
    runTaskSimulation({ taskId: task.id });
  };

  return (
    <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-100 to-sky-100 border border-stone-200/60 flex items-center justify-center text-stone-700">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 tracking-tight">
              {task.productName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>{task.storeName}</span>
              <span aria-hidden="true">·</span>
              <span>{task.variant}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-stone-600">
          <span className="font-semibold text-stone-900">${task.maxPrice}</span>
          <span className="text-stone-400">max</span>
        </div>
      </div>

      {/* Grid Specs */}
      {isEditing ? (
        <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
          <div>
            <label className="block text-stone-500 mb-1">Variant / Size</label>
            <input
              type="text"
              value={task.variant}
              onChange={(e) => setTask({ ...task, variant: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max="5"
              value={task.quantity}
              onChange={(e) => setTask({ ...task, quantity: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">Max Price ($)</label>
            <input
              type="number"
              value={task.maxPrice}
              onChange={(e) => setTask({ ...task, maxPrice: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">Shipping Profile</label>
            <select
              value={task.profileName}
              onChange={(e) => setTask({ ...task, profileName: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Quantity</span>
            <span className="font-semibold text-stone-900 font-mono tabular-nums">{task.quantity} unit(s)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Store Target</span>
            <span className="font-semibold text-stone-900 truncate block">{task.storeName}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Profile</span>
            <span className="font-semibold text-stone-900 truncate block">{task.profileName}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-1">
            <span className="text-[11px] text-stone-500 block">Retries</span>
            <span className="font-semibold text-stone-900 font-mono tabular-nums">{task.retries} attempts</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-stone-100"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditing ? 'Save Changes' : 'Edit Specs'}
        </button>

        <div className="flex items-center gap-2">
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:opacity-95 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-rose-300" />
              Confirm & Arm Task
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 font-medium flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                Armed
              </span>
              <button
                onClick={handleRunSimulation}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-95 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Simulate Drop Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
