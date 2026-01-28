import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assignee } from '@/types/kanban';

export interface TaskComment {
  id: string;
  taskId: string;
  author: Assignee;
  content: string;
  createdAt: Date;
}

type DbComment = {
  id: string;
  task_id: string;
  author: string;
  content: string;
  created_at: string;
};

const mapDbToComment = (dbComment: DbComment): TaskComment => ({
  id: dbComment.id,
  taskId: dbComment.task_id,
  author: dbComment.author as Assignee,
  content: dbComment.content,
  createdAt: new Date(dbComment.created_at),
});

export function useTaskComments(taskId: string | null) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments for the task
  useEffect(() => {
    if (!taskId) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else if (data) {
        setComments(data.map(mapDbToComment));
      }
      setLoading(false);
    };

    fetchComments();
  }, [taskId]);

  // Subscribe to real-time changes for this task's comments
  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`comments-${taskId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Comment change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newComment = mapDbToComment(payload.new as DbComment);
            setComments(prev => {
              if (prev.some(c => c.id === newComment.id)) return prev;
              return [...prev, newComment];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setComments(prev => prev.filter(c => c.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const addComment = useCallback(async (content: string, author: Assignee = 'user') => {
    if (!taskId || !content.trim()) return null;

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    return data ? mapDbToComment(data) : null;
  }, [taskId]);

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
    }
  }, []);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
  };
}
