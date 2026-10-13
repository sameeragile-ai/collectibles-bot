import React from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDroplineStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarn = toast.type === 'warn';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-2xl bg-white border shadow-lg flex items-start justify-between gap-3 text-xs ${
                isSuccess
                  ? 'border-emerald-200 ring-1 ring-emerald-500/10'
                  : isError
                  ? 'border-rose-200 ring-1 ring-rose-500/10'
                  : isWarn
                  ? 'border-amber-200 ring-1 ring-amber-500/10'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div>
                  <h5 className="font-semibold text-stone-900 tracking-tight">{toast.title}</h5>
                  <p className="text-stone-500 text-[11px] mt-0.5 leading-snug">
                    {toast.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
