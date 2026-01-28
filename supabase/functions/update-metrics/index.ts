import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-secret',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify bot secret (simple API key auth for the bot)
    const botSecret = req.headers.get('x-bot-secret');
    const expectedSecret = Deno.env.get('BOT_SECRET');
    
    if (!expectedSecret) {
      console.error('BOT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (botSecret !== expectedSecret) {
      console.error('Invalid bot secret provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { bot_name = 'Crypto_Chad', metrics } = body;

    console.log(`Updating metrics for bot: ${bot_name}`, metrics);

    if (!metrics || typeof metrics !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid metrics payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map camelCase to snake_case for database
    const updateData: Record<string, number> = {};
    
    if (metrics.totalProfit !== undefined) updateData.total_profit = metrics.totalProfit;
    if (metrics.profitYesterday !== undefined) updateData.profit_yesterday = metrics.profitYesterday;
    if (metrics.profitWeek !== undefined) updateData.profit_week = metrics.profitWeek;
    if (metrics.winRateTotal !== undefined) updateData.win_rate_total = metrics.winRateTotal;
    if (metrics.winRateYesterday !== undefined) updateData.win_rate_yesterday = metrics.winRateYesterday;
    if (metrics.winRateWeek !== undefined) updateData.win_rate_week = metrics.winRateWeek;
    if (metrics.tradesTotal !== undefined) updateData.trades_total = metrics.tradesTotal;
    if (metrics.tradesYesterday !== undefined) updateData.trades_yesterday = metrics.tradesYesterday;
    if (metrics.tradesWeek !== undefined) updateData.trades_week = metrics.tradesWeek;
    if (metrics.avgTradeSize !== undefined) updateData.avg_trade_size = metrics.avgTradeSize;
    if (metrics.maxDrawdown !== undefined) updateData.max_drawdown = metrics.maxDrawdown;

    const { data, error } = await supabase
      .from('trading_metrics')
      .update(updateData)
      .eq('bot_name', bot_name)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update metrics', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Metrics updated successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
