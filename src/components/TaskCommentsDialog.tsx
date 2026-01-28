import { useState } from 'react';
import { Bot, User, Send, Trash2, FileText } from 'lucide-react';
import { Task, Assignee } from '@/types/kanban';
import { useTaskComments } from '@/hooks/useTaskComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskCommentsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-loss/20 text-loss',
};

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'For Review',
  'completed': 'Completed',
};

export function TaskCommentsDialog({ task, open, onOpenChange }: TaskCommentsDialogProps) {
  const { comments, loading, addComment, deleteComment } = useTaskComments(task?.id ?? null);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState<Assignee>('user');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    await addComment(newComment, author);
    setNewComment('');
    setSubmitting(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
          {/* Task Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {statusLabels[task.status]}
              </Badge>
              {task.priority && (
                <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                  {task.priority}
                </Badge>
              )}
              <div className="flex items-center gap-1 ml-auto">
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

            {/* Description / Initial Requirements */}
            {task.description && (
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Description / Requirements</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Comments ({comments.length})
            </p>
            
            <ScrollArea className="flex-1 max-h-[200px] pr-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="bg-secondary/30 rounded-lg p-3 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {comment.author === 'Crypto_Chad' ? (
                            <div className="flex items-center gap-1.5 text-primary">
                              <Bot className="w-4 h-4" />
                              <span className="text-sm font-medium">Crypto_Chad</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-cyan">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">You</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-loss"
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Comment as:</span>
              <Select value={author} onValueChange={(v) => setAuthor(v as Assignee)}>
                <SelectTrigger className="w-[140px] h-8 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-cyan" />
                      <span>Me</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Crypto_Chad">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3 text-primary" />
                      <span>Crypto_Chad</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="bg-secondary border-border min-h-[60px] flex-1 resize-none"
              />
              <Button 
                type="submit" 
                size="icon"
                className="h-[60px] w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!newComment.trim() || submitting}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
