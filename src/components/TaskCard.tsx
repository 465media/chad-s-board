import { Bot, User, GripVertical, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { Task, TaskStatus } from '@/types/kanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBotToken } from '@/contexts/BotTokenContext';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onComment: (task: Task) => void;
  isDragging?: boolean;
  hasUnread?: boolean;
}

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'For Review',
  'completed': 'Completed',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-loss/20 text-loss',
};

export function TaskCard({ task, onMove, onDelete, onEdit, onComment, isDragging, hasUnread }: TaskCardProps) {
  const { isBot } = useBotToken();
  const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed'];

  // Determine who the "other party" is for the unread indicator
  const otherPartyLabel = isBot ? 'User' : 'Chad';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on action buttons or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menu"]')) {
      return;
    }
    onComment(task);
  };
  
  return (
    <div 
      className={`task-card group animate-slide-in cursor-pointer relative ${isDragging ? 'opacity-50 scale-105' : ''} ${hasUnread ? 'ring-2 ring-accent/50' : ''}`}
      draggable
      onClick={handleCardClick}
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Unread indicator */}
      {hasUnread && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">
          <MessageCircle className="w-3 h-3" />
          <span>New from {otherPartyLabel}</span>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-foreground text-sm leading-tight">{task.title}</h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onEdit(task)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:text-loss"
                  onClick={() => onDelete(task.id)}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary text-xs">
                    Move →
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {statuses.filter(s => s !== task.status).map(status => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(task.id, status);
                      }}
                    >
                      {statusLabels[status]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
