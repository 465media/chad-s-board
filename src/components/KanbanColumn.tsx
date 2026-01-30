import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onComment: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  unreadStatus: { [taskId: string]: boolean };
}

const columnStyles: Record<TaskStatus, { border: string; badge: string; badgeBg: string }> = {
  'todo': { 
    border: 'border-t-muted-foreground/50', 
    badge: 'text-muted-foreground',
    badgeBg: 'bg-muted/50'
  },
  'in-progress': { 
    border: 'border-t-accent', 
    badge: 'text-accent',
    badgeBg: 'bg-accent/10'
  },
  'review': { 
    border: 'border-t-warning', 
    badge: 'text-warning',
    badgeBg: 'bg-warning/10'
  },
  'completed': { 
    border: 'border-t-profit', 
    badge: 'text-profit',
    badgeBg: 'bg-profit/10'
  },
};

export function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  onDelete, 
  onEdit,
  onComment,
  onAddTask,
  unreadStatus 
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const styles = columnStyles[id];

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column border-t-2 ${styles.border} ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''} transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles.badgeBg} ${styles.badge}`}>
            {tasks.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onAddTask(id)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3 min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDelete={onDelete}
            onEdit={onEdit}
            onComment={onComment}
            hasUnread={unreadStatus[task.id] || false}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className={`text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg transition-colors ${isOver ? 'border-primary bg-primary/10' : 'border-border'}`}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
