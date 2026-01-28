import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TradingMetrics } from '@/types/kanban';

const defaultMetrics: TradingMetrics = {
  totalProfit: 0,
  profitYesterday: 0,
  profitWeek: 0,
  winRateTotal: 0,
  winRateYesterday: 0,
  winRateWeek: 0,
  tradesTotal: 0,
  tradesYesterday: 0,
  tradesWeek: 0,
  avgTradeSize: 0,
  maxDrawdown: 0,
};

export function useTradingMetrics(botName: string = 'Crypto_Chad') {
  const [metrics, setMetrics] = useState<TradingMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch initial metrics
  const fetchMetrics = useCallback(async () => {
    console.log('Fetching metrics for:', botName);
    
    const { data, error } = await supabase
      .from('trading_metrics')
      .select('*')
      .eq('bot_name', botName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching metrics:', error);
      return;
    }

    if (data) {
      setMetrics({
        totalProfit: Number(data.total_profit),
        profitYesterday: Number(data.profit_yesterday),
        profitWeek: Number(data.profit_week),
        winRateTotal: Number(data.win_rate_total),
        winRateYesterday: Number(data.win_rate_yesterday),
        winRateWeek: Number(data.win_rate_week),
        tradesTotal: data.trades_total,
        tradesYesterday: data.trades_yesterday,
        tradesWeek: data.trades_week,
        avgTradeSize: Number(data.avg_trade_size),
        maxDrawdown: Number(data.max_drawdown),
      });
      setLastUpdated(new Date(data.updated_at));
    }
    
    setLoading(false);
  }, [botName]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('trading_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trading_metrics',
          filter: `bot_name=eq.${botName}`,
        },
        (payload) => {
          console.log('Real-time metrics update:', payload);
          const data = payload.new as Record<string, unknown>;
          
          setMetrics({
            totalProfit: Number(data.total_profit),
            profitYesterday: Number(data.profit_yesterday),
            profitWeek: Number(data.profit_week),
            winRateTotal: Number(data.win_rate_total),
            winRateYesterday: Number(data.win_rate_yesterday),
            winRateWeek: Number(data.win_rate_week),
            tradesTotal: data.trades_total as number,
            tradesYesterday: data.trades_yesterday as number,
            tradesWeek: data.trades_week as number,
            avgTradeSize: Number(data.avg_trade_size),
            maxDrawdown: Number(data.max_drawdown),
          });
          setLastUpdated(new Date(data.updated_at as string));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [botName, fetchMetrics]);

  return {
    metrics,
    loading,
    lastUpdated,
    refetch: fetchMetrics,
  };
}
