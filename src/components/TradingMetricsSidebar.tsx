import { TrendingUp, TrendingDown, Activity, BarChart3, Bot } from 'lucide-react';
import { TradingMetrics } from '@/types/kanban';

interface TradingMetricsSidebarProps {
  metrics: TradingMetrics;
}

function MetricRow({ 
  label, 
  value, 
  prefix = '', 
  suffix = '',
  isProfit = false,
  showTrend = false,
}: { 
  label: string; 
  value: number; 
  prefix?: string;
  suffix?: string;
  isProfit?: boolean;
  showTrend?: boolean;
}) {
  const isPositive = value >= 0;
  const displayValue = isProfit 
    ? `${prefix}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`
    : `${prefix}${value.toLocaleString()}${suffix}`;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm font-medium ${isProfit ? (isPositive ? 'text-profit' : 'text-loss') : 'text-foreground'}`}>
          {isProfit && !isPositive && '-'}{displayValue}
        </span>
        {showTrend && isProfit && (
          isPositive 
            ? <TrendingUp className="w-4 h-4 text-profit" />
            : <TrendingDown className="w-4 h-4 text-loss" />
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

export function TradingMetricsSidebar({ metrics }: TradingMetricsSidebarProps) {
  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border p-4 flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Crypto_Chad</h2>
          <p className="text-xs text-muted-foreground">Trading Bot v2.3</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-profit/20 text-profit text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse-glow" />
            Active
          </span>
        </div>
      </div>

      {/* Profit Section */}
      <div className="sidebar-section">
        <SectionHeader icon={TrendingUp} title="Profit" />
        <div className="space-y-1 divide-y divide-border/30">
          <MetricRow label="Total" value={metrics.totalProfit} prefix="$" isProfit showTrend />
          <MetricRow label="Yesterday" value={metrics.profitYesterday} prefix="$" isProfit showTrend />
          <MetricRow label="7 Days" value={metrics.profitWeek} prefix="$" isProfit showTrend />
        </div>
      </div>

      {/* Win Rate Section */}
      <div className="sidebar-section">
        <SectionHeader icon={Activity} title="Win Rate" />
        <div className="space-y-1 divide-y divide-border/30">
          <MetricRow label="Total" value={metrics.winRateTotal} suffix="%" isProfit />
          <MetricRow label="Yesterday" value={metrics.winRateYesterday} suffix="%" isProfit />
          <MetricRow label="7 Days" value={metrics.winRateWeek} suffix="%" isProfit />
        </div>
      </div>

      {/* Trade Count Section */}
      <div className="sidebar-section">
        <SectionHeader icon={BarChart3} title="Trade Count" />
        <div className="space-y-1 divide-y divide-border/30">
          <MetricRow label="Total" value={metrics.tradesTotal} />
          <MetricRow label="Yesterday" value={metrics.tradesYesterday} />
          <MetricRow label="7 Days" value={metrics.tradesWeek} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </aside>
  );
}
