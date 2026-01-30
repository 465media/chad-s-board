import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskCommentsDialog } from './TaskCommentsDialog';
import { TaskCard } from './TaskCard';
import { useUnreadComments } from '@/hooks/useUnreadComments';

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Track unread comments
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const { unreadStatus, markAsRead } = useUnreadComments(taskIds);

  // Configure sensors for both mouse/trackpad and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold before drag starts on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const isColumn = columns.some(col => col.id === overId);
    
    if (isColumn) {
      const newStatus = overId as TaskStatus;
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        onMove(taskId, newStatus);
      }
    } else {
      // Dropped on another task - find which column that task is in
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== overTask.status) {
          onMove(taskId, overTask.status);
        }
      }
    }
  };

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onDelete={onDelete}
            onEdit={handleEditTask}
            onComment={handleCommentTask}
            onAddTask={handleAddTask}
            unreadStatus={unreadStatus}
          />
        ))}
      </div>

      {/* Drag overlay - shows the dragged item */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              onDelete={() => {}}
              onEdit={() => {}}
              onComment={() => {}}
              hasUnread={unreadStatus[activeTask.id] || false}
              isDragOverlay
            />
          </div>
        ) : null}
      </DragOverlay>

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
        onMarkAsRead={markAsRead}
      />
    </DndContext>
  );
}
