import { Plus, Bot } from 'lucide-react';
import { TradingMetricsSidebar } from '@/components/TradingMetricsSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useKanban } from '@/hooks/useKanban';
import { useTradingMetrics } from '@/hooks/useTradingMetrics';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useKanban();
  const { metrics, loading, lastUpdated } = useTradingMetrics('Crypto_Chad');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <TradingMetricsSidebar metrics={metrics} lastUpdated={lastUpdated} loading={loading} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Chad's Task Board</h1>
              <p className="text-xs text-muted-foreground">Manage tasks for you and Crypto_Chad</p>
            </div>
          </div>
          
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            onClick={() => document.dispatchEvent(new CustomEvent('openAddTask'))}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </header>
        
        {/* Kanban Board */}
        <div className="flex-1 overflow-auto">
          <KanbanBoard
            tasks={tasks}
            onMove={moveTask}
            onDelete={deleteTask}
            onAdd={addTask}
            onUpdate={updateTask}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
