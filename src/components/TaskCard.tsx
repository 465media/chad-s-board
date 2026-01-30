import { Bot, User, GripVertical, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types/kanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBotToken } from '@/contexts/BotTokenContext';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onComment: (task: Task) => void;
  hasUnread?: boolean;
  isDragOverlay?: boolean;
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-loss/20 text-loss',
};

export function TaskCard({ task, onDelete, onEdit, onComment, hasUnread, isDragOverlay }: TaskCardProps) {
  const { isBot } = useBotToken();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    disabled: isDragOverlay,
  });

  // Determine who the "other party" is for the unread indicator
  const otherPartyLabel = isBot ? 'User' : 'Chad';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    // Don't open if we're dragging
    if (isDragging) {
      return;
    }
    onComment(task);
  };

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
  } : undefined;
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`task-card group animate-slide-in relative touch-none ${isDragging ? 'opacity-50 scale-105 ring-2 ring-primary' : ''} ${hasUnread ? 'ring-2 ring-accent/50' : ''}`}
      onClick={handleCardClick}
    >
      {/* Unread indicator */}
      {hasUnread && !isDragging && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm z-10">
          <MessageCircle className="w-3 h-3" />
          <span>New from {otherPartyLabel}</span>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div 
          {...listeners} 
          {...attributes}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-foreground text-sm leading-tight">{task.title}</h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:text-loss"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {task.priority && (
                <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                  {task.priority}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              {task.assignee === 'Crypto_Chad' ? (
                <div className="flex items-center gap-1 text-primary">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Chad</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-cyan">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">You</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
