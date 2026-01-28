import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus, Assignee } from '@/types/kanban';

type DbTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee: string;
  priority: string;
  created_at: string;
};

const mapDbToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  status: dbTask.status as TaskStatus,
  assignee: dbTask.assignee as Assignee,
  priority: dbTask.priority as Task['priority'],
  createdAt: new Date(dbTask.created_at),
});

export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
      } else if (data) {
        setTasks(data.map(mapDbToTask));
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask = mapDbToTask(payload.new as DbTask);
            setTasks(prev => {
              // Avoid duplicates
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [...prev, newTask];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = mapDbToTask(payload.new as DbTask);
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setTasks(prev => prev.filter(t => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = useCallback(async (
    title: string,
    description: string,
    assignee: Assignee,
    priority: Task['priority'] = 'medium',
    status: TaskStatus = 'todo'
  ) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        assignee,
        priority,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return null;
    }

    return data ? mapDbToTask(data) : null;
  }, []);

  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
