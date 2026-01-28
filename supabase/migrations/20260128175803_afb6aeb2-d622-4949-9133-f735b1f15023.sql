-- Create trading_metrics table to store bot metrics
CREATE TABLE public.trading_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_name TEXT NOT NULL DEFAULT 'Crypto_Chad',
    total_profit DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit_yesterday DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit_week DECIMAL(15,2) NOT NULL DEFAULT 0,
    win_rate_total DECIMAL(5,2) NOT NULL DEFAULT 0,
    win_rate_yesterday DECIMAL(5,2) NOT NULL DEFAULT 0,
    win_rate_week DECIMAL(5,2) NOT NULL DEFAULT 0,
    trades_total INTEGER NOT NULL DEFAULT 0,
    trades_yesterday INTEGER NOT NULL DEFAULT 0,
    trades_week INTEGER NOT NULL DEFAULT 0,
    avg_trade_size DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_drawdown DECIMAL(15,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(bot_name)
);

-- Enable RLS
ALTER TABLE public.trading_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read metrics (public dashboard)
CREATE POLICY "Anyone can view trading metrics"
ON public.trading_metrics
FOR SELECT
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_trading_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trading_metrics_timestamp
BEFORE UPDATE ON public.trading_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_trading_metrics_updated_at();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_metrics;

-- Insert initial metrics for Crypto_Chad
INSERT INTO public.trading_metrics (
    bot_name, total_profit, profit_yesterday, profit_week,
    win_rate_total, win_rate_yesterday, win_rate_week,
    trades_total, trades_yesterday, trades_week,
    avg_trade_size, max_drawdown
) VALUES (
    'Crypto_Chad', 12450.32, 234.56, 1823.45,
    67.8, 75.0, 71.2,
    1847, 24, 156,
    847.23, -2145.67
);