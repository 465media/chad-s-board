import { useState, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { Task, TaskStatus, Assignee } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string, assignee: Assignee, priority: Task['priority'], status: TaskStatus) => void;
  editTask?: Task | null;
  onUpdate?: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  defaultStatus?: TaskStatus;
}

export function AddTaskDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editTask,
  onUpdate,
  defaultStatus 
}: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<Assignee>('Crypto_Chad');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setAssignee(editTask.assignee);
      setPriority(editTask.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setAssignee('Crypto_Chad');
      setPriority('medium');
    }
  }, [editTask, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editTask && onUpdate) {
      onUpdate(editTask.id, { title, description, assignee, priority });
    } else {
      onSubmit(title, description, assignee, priority, defaultStatus || 'todo');
    }
    
    onOpenChange(false);
    setTitle('');
    setDescription('');
    setAssignee('Crypto_Chad');
    setPriority('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="bg-secondary border-border"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              className="bg-secondary border-border min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={assignee} onValueChange={(v) => setAssignee(v as Assignee)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crypto_Chad">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <span>Crypto_Chad</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan" />
                      <span>Me</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editTask ? 'Update' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
