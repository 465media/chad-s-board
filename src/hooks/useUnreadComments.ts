import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBotToken } from '@/contexts/BotTokenContext';

interface UnreadStatus {
  [taskId: string]: boolean;
}

export function useUnreadComments(taskIds: string[]) {
  const { isBot } = useBotToken();
  const [unreadStatus, setUnreadStatus] = useState<UnreadStatus>({});

  // Determine which "other party" we're looking for comments from
  const otherAuthor = isBot ? 'user' : 'Crypto_Chad';
  const viewedColumn = isBot ? 'last_viewed_bot' : 'last_viewed_user';

  useEffect(() => {
    if (taskIds.length === 0) return;

    const checkUnread = async () => {
      // Get tasks with their last viewed timestamps
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, last_viewed_user, last_viewed_bot')
        .in('id', taskIds);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        return;
      }

      // Get the latest comment from the "other party" for each task
      const { data: comments, error: commentsError } = await supabase
        .from('task_comments')
        .select('task_id, created_at, author')
        .in('task_id', taskIds)
        .eq('author', otherAuthor)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return;
      }

      // Build unread status map
      const newStatus: UnreadStatus = {};
      
      for (const taskId of taskIds) {
        const task = tasks?.find(t => t.id === taskId);
        const latestComment = comments?.find(c => c.task_id === taskId);
        
        if (!latestComment) {
          newStatus[taskId] = false;
          continue;
        }

        const lastViewed = isBot ? task?.last_viewed_bot : task?.last_viewed_user;
        
        if (!lastViewed) {
          // Never viewed = unread if there are comments from other party
          newStatus[taskId] = true;
        } else {
          // Unread if latest comment is newer than last viewed
          newStatus[taskId] = new Date(latestComment.created_at) > new Date(lastViewed);
        }
      }

      setUnreadStatus(newStatus);
    };

    checkUnread();

    // Subscribe to comment changes
    const channel = supabase
      .channel('comments-unread')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments' },
        () => {
          checkUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskIds.join(','), isBot, otherAuthor]);

  const markAsRead = useCallback(async (taskId: string) => {
    const updateField = isBot ? 'last_viewed_bot' : 'last_viewed_user';
    
    const { error } = await supabase
      .from('tasks')
      .update({ [updateField]: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error marking as read:', error);
      return;
    }

    // Update local state
    setUnreadStatus(prev => ({ ...prev, [taskId]: false }));
  }, [isBot]);

  return { unreadStatus, markAsRead };
}
