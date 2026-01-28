-- Create tasks table
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed')),
  assignee text NOT NULL DEFAULT 'user' CHECK (assignee IN ('user', 'Crypto_Chad')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view tasks (no auth in this app)
CREATE POLICY "Anyone can view tasks"
  ON public.tasks FOR SELECT
  USING (true);

-- Allow anyone to insert tasks
CREATE POLICY "Anyone can insert tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update tasks
CREATE POLICY "Anyone can update tasks"
  ON public.tasks FOR UPDATE
  USING (true);

-- Allow anyone to delete tasks
CREATE POLICY "Anyone can delete tasks"
  ON public.tasks FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Insert initial sample tasks
INSERT INTO public.tasks (title, description, status, assignee, priority) VALUES
  ('Analyze BTC/USDT patterns', 'Review 4h chart for entry signals', 'todo', 'Crypto_Chad', 'high'),
  ('Backtest new strategy', 'Run backtest on ETH momentum strategy', 'in-progress', 'Crypto_Chad', 'medium'),
  ('Review risk parameters', 'Check stop-loss and take-profit levels', 'review', 'user', 'high'),
  ('Deploy updated algorithm', 'Push v2.3 to production', 'completed', 'Crypto_Chad', 'medium');