import React, { useState } from 'react';
import { Bot, Plus, MessageSquare, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useBotToken } from '@/contexts/BotTokenContext';
import { useBotActions } from '@/hooks/useBotActions';
import { Button } from '@/components/ui/button';
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
import { Task } from '@/types/kanban';

interface BotControlPanelProps {
  tasks: Task[];
}

type ActiveForm = 'none' | 'create' | 'comment' | 'complete';

export const BotControlPanel: React.FC<BotControlPanelProps> = ({ tasks }) => {
  const { isBot } = useBotToken();
  const { loading, createTask, addComment, completeTask } = useBotActions();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');
  
  // Create task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Comment form state
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [commentContent, setCommentContent] = useState('');
  
  // Complete task state
  const [completeTaskId, setCompleteTaskId] = useState('');
  const [completionComment, setCompletionComment] = useState('');

  if (!isBot) return null;

  const resetForms = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setSelectedTaskId('');
    setCommentContent('');
    setCompleteTaskId('');
    setCompletionComment('');
    setActiveForm('none');
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    const result = await createTask({
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
    });
    if (result) resetForms();
  };

  const handleAddComment = async () => {
    if (!selectedTaskId || !commentContent.trim()) return;
    const result = await addComment({
      task_id: selectedTaskId,
      content: commentContent,
    });
    if (result) resetForms();
  };

  const handleCompleteTask = async () => {
    if (!completeTaskId) return;
    const result = await completeTask({
      task_id: completeTaskId,
      comment: completionComment || undefined,
    });
    if (result) resetForms();
  };

  const incompleteTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card border border-primary/50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-primary/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Bot Control Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-primary/30 rounded-full text-primary-foreground">
            Active
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Action Buttons */}
          {activeForm === 'none' && (
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => setActiveForm('create')}
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => setActiveForm('comment')}
                disabled={loading || incompleteTasks.length === 0}
              >
                <MessageSquare className="w-4 h-4" />
                Add Comment
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => setActiveForm('complete')}
                disabled={loading || incompleteTasks.length === 0}
              >
                <CheckCircle className="w-4 h-4" />
                Complete Task
              </Button>
            </div>
          )}

          {/* Create Task Form */}
          {activeForm === 'create' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Create Task</span>
                <Button variant="ghost" size="icon" onClick={() => setActiveForm('none')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-task-title">Title</Label>
                <Input
                  id="bot-task-title"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-task-description">Description</Label>
                <Textarea
                  id="bot-task-description"
                  placeholder="Task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-task-priority">Priority</Label>
                <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as 'low' | 'medium' | 'high')}>
                  <SelectTrigger id="bot-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTask} disabled={loading || !taskTitle.trim()} className="w-full">
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          )}

          {/* Add Comment Form */}
          {activeForm === 'comment' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Add Comment</span>
                <Button variant="ghost" size="icon" onClick={() => setActiveForm('none')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-comment-task">Select Task</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger id="bot-comment-task">
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-comment-content">Comment</Label>
                <Textarea
                  id="bot-comment-content"
                  placeholder="Your comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleAddComment} 
                disabled={loading || !selectedTaskId || !commentContent.trim()} 
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          )}

          {/* Complete Task Form */}
          {activeForm === 'complete' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Complete Task</span>
                <Button variant="ghost" size="icon" onClick={() => setActiveForm('none')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-complete-task">Select Task</Label>
                <Select value={completeTaskId} onValueChange={setCompleteTaskId}>
                  <SelectTrigger id="bot-complete-task">
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incompleteTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot-complete-comment">Completion Note (optional)</Label>
                <Textarea
                  id="bot-complete-comment"
                  placeholder="Optional completion note..."
                  value={completionComment}
                  onChange={(e) => setCompletionComment(e.target.value)}
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleCompleteTask} 
                disabled={loading || !completeTaskId} 
                className="w-full"
              >
                {loading ? 'Completing...' : 'Complete Task'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
