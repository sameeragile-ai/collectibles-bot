import React from 'react';
import { useDroplineStore } from '../../store/useDroplineStore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, CheckCircle, Zap, DollarSign, ArrowUpRight } from 'lucide-react';

export const StatsCard: React.FC = () => {
  const { history } = useDroplineStore();

  const totalSpent = history.reduce((acc, h) => (h.status === 'secured' ? acc + h.retailPrice : acc), 0);
  const totalValue = history.reduce((acc, h) => (h.status === 'secured' ? acc + h.resalePrice : acc), 0);
  const securedCount = history.filter((h) => h.status === 'secured').length;
  const totalCount = history.length;
  const successRate = totalCount > 0 ? ((securedCount / totalCount) * 100).toFixed(1) : '100';

  const avgMs =
    totalCount > 0
      ? Math.round(
          history.reduce((acc, h) => acc + h.checkoutMs, 0) / totalCount
        )
      : 395;

  // Chart data from recent history items
  const chartData = history
    .slice(0, 7)
    .reverse()
    .map((item, idx) => ({
      name: item.date.split(',')[0],
      latency: item.checkoutMs,
      value: item.resalePrice,
      spend: item.retailPrice,
    }));

  return (
    <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 tracking-tight">
              Bot Performance & Resale Spread
            </h4>
            <span className="text-[11px] text-stone-500">
              Billing cycle: Oct 2026 · {totalCount} total drop executions
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
          +{Math.round(((totalValue - totalSpent) / (totalSpent || 1)) * 100)}% ROI
        </span>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-0.5">
          <span className="text-[10px] text-stone-500 block">Success Rate</span>
          <span className="font-bold text-stone-900 font-mono tabular-nums text-sm">
            {successRate}%
          </span>
          <span className="text-[10px] text-stone-400 block">{securedCount}/{totalCount} drops</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-0.5">
          <span className="text-[10px] text-stone-500 block">Avg Checkout</span>
          <span className="font-bold text-stone-900 font-mono tabular-nums text-sm">
            {avgMs} ms
          </span>
          <span className="text-[10px] text-stone-400 block">Sub-second cart</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-100 space-y-0.5">
          <span className="text-[10px] text-stone-500 block">Total Capital</span>
          <span className="font-bold text-stone-900 font-mono tabular-nums text-sm">
            ${totalSpent.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-400 block">Retail purchase</span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-0.5">
          <span className="text-[10px] text-emerald-700 font-medium block">Est. Market Value</span>
          <span className="font-bold text-emerald-900 font-mono tabular-nums text-sm">
            ${totalValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 block font-mono">
            +${(totalValue - totalSpent).toLocaleString()} profit
          </span>
        </div>
      </div>

      {/* Latency History Chart */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
          <span>Checkout Latency Trace (Last 7 drops)</span>
          <span className="font-mono text-stone-400">Target: &lt;500ms</span>
        </div>
        <div className="h-32 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A29BFE" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#74B9FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} stroke="#e7e5e4" />
              <YAxis tick={{ fontSize: 10, fill: '#78716c' }} stroke="#e7e5e4" domain={[200, 700]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-stone-900 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-mono shadow-md">
                        <span>{payload[0].value} ms</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
