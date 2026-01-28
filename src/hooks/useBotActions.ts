import { useState } from 'react';
import { useBotToken } from '@/contexts/BotTokenContext';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'review' | 'completed';
}

interface AddCommentPayload {
  task_id: string;
  content: string;
}

interface CompleteTaskPayload {
  task_id: string;
  comment?: string;
}

export const useBotActions = () => {
  const { token } = useBotToken();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const callBotAction = async (action: string, payload: CreateTaskPayload | AddCommentPayload | CompleteTaskPayload) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'No bot token available',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/bot-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-secret': token,
        },
        body: JSON.stringify({ action, payload }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }

      toast({
        title: 'Success',
        description: `Action "${action}" completed successfully`,
      });

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload: CreateTaskPayload) => {
    return callBotAction('create_task', payload);
  };

  const addComment = async (payload: AddCommentPayload) => {
    return callBotAction('add_comment', payload);
  };

  const completeTask = async (payload: CompleteTaskPayload) => {
    return callBotAction('complete_task', payload);
  };

  return {
    loading,
    createTask,
    addComment,
    completeTask,
  };
};
