import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskCommentsDialog } from './TaskCommentsDialog';

interface KanbanBoardProps {
  tasks: Task[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAdd: (title: string, description: string, assignee: Task['assignee'], priority: Task['priority'], status: TaskStatus) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'For Review' },
  { id: 'completed', title: 'Completed' },
];

export function KanbanBoard({ tasks, onMove, onDelete, onAdd, onUpdate }: KanbanBoardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Listen for the header "Add Task" button event
  useEffect(() => {
    const handleOpenAddTask = () => {
      setEditingTask(null);
      setDefaultStatus('todo');
      setDialogOpen(true);
    };

    document.addEventListener('openAddTask', handleOpenAddTask);
    return () => document.removeEventListener('openAddTask', handleOpenAddTask);
  }, []);

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCommentTask = (task: Task) => {
    setCommentsTask(task);
    setCommentsOpen(true);
  };

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onMove={onMove}
            onDelete={onDelete}
            onEdit={handleEditTask}
            onComment={handleCommentTask}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onAdd}
        editTask={editingTask}
        onUpdate={onUpdate}
        defaultStatus={defaultStatus}
      />

      <TaskCommentsDialog
        task={commentsTask}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />
    </>
  );
}
