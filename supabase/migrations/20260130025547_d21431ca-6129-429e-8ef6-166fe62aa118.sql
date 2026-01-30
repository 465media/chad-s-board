-- Add columns to track when user and bot last viewed each task
ALTER TABLE public.tasks 
ADD COLUMN last_viewed_user timestamp with time zone DEFAULT NULL,
ADD COLUMN last_viewed_bot timestamp with time zone DEFAULT NULL;