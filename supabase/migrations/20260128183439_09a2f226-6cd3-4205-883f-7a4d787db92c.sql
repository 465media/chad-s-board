-- Create comments table for tasks
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching tasks table)
CREATE POLICY "Anyone can view comments" 
ON public.task_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert comments" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete comments" 
ON public.task_comments 
FOR DELETE 
USING (true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;