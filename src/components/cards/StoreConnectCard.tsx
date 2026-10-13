import React, { useState, useEffect } from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import { motion } from 'motion/react';
import {
  Store,
  CheckCircle2,
  Loader2,
  Globe,
  Shield,
  Zap,
  ShoppingBag,
} from 'lucide-react';

interface StoreConnectCardProps {
  url?: string;
  name?: string;
}

interface TestStep {
  label: string;
  sub: string;
}

const TEST_STEPS: TestStep[] = [
  { label: 'Resolving DNS & Host IP', sub: 'Target origin verified' },
  { label: 'Probing Platform Engine', sub: 'Shopify Storefront API endpoint' },
  { label: 'Testing Anti-Bot Bypass', sub: 'Cloudflare Turnstile session hook' },
  { label: 'Simulating Cart Inject', sub: 'Cart token validated (36ms)' },
];

export const StoreConnectCard: React.FC<StoreConnectCardProps> = ({
  url = 'https://example-collectibles.com',
  name = 'Example Collectibles',
}) => {
  const { addStore } = useDroplineStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < TEST_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsCompleted(true);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  const handleSaveToStore = () => {
    addStore({
      name,
      storeType: 'shopify',
      url,
      status: 'connected',
      proxyLatencyMs: 36,
      antiBotBypass: 'Cloudflare Turnstile Hook v2.4',
      cartDelayMs: 95,
    });
  };

  return (
    <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
            <Store className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 tracking-tight">
              {name}
            </h4>
            <span className="text-[11px] text-stone-500 font-mono">{url}</span>
          </div>
        </div>

        <div>
          {isCompleted ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected (36ms)
            </span>
          ) : (
            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
              Testing Handshake
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {TEST_STEPS.map((step, idx) => {
          const isDone = idx < currentStep || isCompleted;
          const isRunning = idx === currentStep && !isCompleted;

          return (
            <div
              key={step.label}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isDone
                  ? 'bg-stone-50/80 border-stone-200/70'
                  : isRunning
                  ? 'bg-purple-50/40 border-purple-200'
                  : 'bg-stone-50/30 border-stone-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isRunning
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : isRunning ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div>
                  <span
                    className={`block font-medium ${
                      isRunning ? 'text-purple-950 font-semibold' : 'text-stone-900'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[11px] text-stone-500">{step.sub}</span>
                </div>
              </div>

              {isDone && (
                <span className="text-[10px] text-emerald-600 font-mono font-medium">
                  Verified
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isCompleted && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveToStore}
            className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Arm Drops for {name}
          </button>
        </div>
      )}
    </div>
  );
};
