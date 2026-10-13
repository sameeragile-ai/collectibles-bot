import React from 'react';
import { BotTask } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Search,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { runTaskSimulation } from '../../lib/simulator/engine';

interface TaskRunCardProps {
  task: BotTask;
}

interface StepInfo {
  key: BotTask['currentStep'];
  label: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepInfo[] = [
  {
    key: 'monitoring',
    label: 'Monitoring Store',
    subtext: 'Polling 120ms intervals',
    icon: Radio,
  },
  {
    key: 'item_detected',
    label: 'Item Detected',
    subtext: 'Variant SKU matched',
    icon: Search,
  },
  {
    key: 'added_to_cart',
    label: 'Added to Cart',
    subtext: 'Session payload injected',
    icon: ShoppingCart,
  },
  {
    key: 'checking_out',
    label: 'Checking Out',
    subtext: 'Queue bypass & payment',
    icon: CreditCard,
  },
  {
    key: 'secured',
    label: 'Drop Secured',
    subtext: 'Receipt confirmed',
    icon: CheckCircle2,
  },
];

export const TaskRunCard: React.FC<TaskRunCardProps> = ({ task }) => {
  const currentStepIndex = STEPS.findIndex((s) => s.key === task.currentStep);
  const isFailed = task.status === 'failed' || task.currentStep === 'failed';
  const isSecured = task.status === 'secured' || task.currentStep === 'secured';

  const getStepStatus = (index: number) => {
    if (isFailed && index >= 3) return 'error';
    if (isSecured) return 'complete';
    if (index < currentStepIndex) return 'complete';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  const handleRetry = () => {
    runTaskSimulation({ taskId: task.id });
  };

  return (
    <div
      className={`w-full max-w-xl bg-white border rounded-2xl p-5 shadow-sm space-y-5 transition-all overflow-hidden relative ${
        isSecured
          ? 'border-emerald-200/80 shadow-emerald-500/5 ring-1 ring-emerald-500/10'
          : isFailed
          ? 'border-rose-200/90 shadow-rose-500/5'
          : 'border-stone-200/80'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-stone-900 tracking-tight">
              {task.productName}
            </h4>
            {isSecured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Secured
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="w-3 h-3" />
                Failed
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Target: {task.storeName} · {task.variant} · Qty {task.quantity}
          </p>
        </div>

        {task.stepTimingMs?.total ? (
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Total Latency</span>
            <span className="text-sm font-bold font-mono tabular-nums text-stone-900">
              {task.stepTimingMs.total} ms
            </span>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-stone-400 block">Status</span>
            <span className="text-xs font-semibold text-stone-700 capitalize">
              {task.status}
            </span>
          </div>
        )}
      </div>

      {/* Stepped Timeline */}
      <div className="relative pl-6 space-y-4">
        {/* Continuous connector line */}
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-stone-100 -translate-x-1/2" />

        {STEPS.map((step, idx) => {
          const stepStatus = getStepStatus(idx);
          const Icon = step.icon;

          let timingLabel = '';
          if (step.key === 'monitoring' && task.stepTimingMs?.monitoring) {
            timingLabel = `${task.stepTimingMs.monitoring}ms ping`;
          } else if (step.key === 'item_detected' && task.stepTimingMs?.detected) {
            timingLabel = `+${task.stepTimingMs.detected}ms`;
          } else if (step.key === 'added_to_cart' && task.stepTimingMs?.carted) {
            timingLabel = `+${task.stepTimingMs.carted}ms`;
          } else if (step.key === 'checking_out' && task.stepTimingMs?.checkout) {
            timingLabel = `+${task.stepTimingMs.checkout}ms`;
          }

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="relative flex items-center justify-between text-xs"
            >
              {/* Dot Icon Indicator */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  stepStatus === 'complete'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : stepStatus === 'active'
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                    : stepStatus === 'error'
                    ? 'bg-rose-500 text-white ring-4 ring-rose-100'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
              </div>

              {/* Step info text */}
              <div className="pl-2">
                <span
                  className={`font-medium block ${
                    stepStatus === 'active'
                      ? 'text-purple-900 font-semibold'
                      : stepStatus === 'complete'
                      ? 'text-stone-900'
                      : stepStatus === 'error'
                      ? 'text-rose-900 font-semibold'
                      : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-stone-500">{step.subtext}</span>
              </div>

              {/* Latency timing badge */}
              {timingLabel && (
                <span className="font-mono tabular-nums text-[11px] text-stone-500 bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-md">
                  {timingLabel}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Outcome Banner */}
      <AnimatePresence>
        {isSecured && task.orderNumber && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-semibold text-emerald-900 block">
                Order Confirmed · #{task.orderNumber}
              </span>
              <span className="text-emerald-700 text-[11px]">
                Dispatched to {task.profileName}. Receipt emailed.
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>
        )}

        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-2"
          >
            <div className="flex items-start gap-2 text-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-semibold block">Checkout Interrupted</span>
                <span className="text-rose-700 text-[11px]">
                  {task.failureReason || 'Stock depleted before final token handshake.'}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
