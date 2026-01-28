import { useState, useCallback } from 'react';
import { Task, TaskStatus, Assignee, TradingMetrics } from '@/types/kanban';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialTasks: Task[] = [
  {
    id: generateId(),
    title: 'Analyze BTC/USDT patterns',
    description: 'Review 4h chart for entry signals',
    status: 'todo',
    assignee: 'Crypto_Chad',
    createdAt: new Date(),
    priority: 'high',
  },
  {
    id: generateId(),
    title: 'Backtest new strategy',
    description: 'Run backtest on ETH momentum strategy',
    status: 'in-progress',
    assignee: 'Crypto_Chad',
    createdAt: new Date(),
    priority: 'medium',
  },
  {
    id: generateId(),
    title: 'Review risk parameters',
    description: 'Check stop-loss and take-profit levels',
    status: 'review',
    assignee: 'user',
    createdAt: new Date(),
    priority: 'high',
  },
  {
    id: generateId(),
    title: 'Deploy updated algorithm',
    description: 'Push v2.3 to production',
    status: 'completed',
    assignee: 'Crypto_Chad',
    createdAt: new Date(),
    priority: 'medium',
  },
];

const initialMetrics: TradingMetrics = {
  totalProfit: 12450.32,
  profitYesterday: 234.56,
  profitWeek: 1823.45,
  winRateTotal: 67.8,
  winRateYesterday: 75.0,
  winRateWeek: 71.2,
  tradesTotal: 1847,
  tradesYesterday: 24,
  tradesWeek: 156,
};

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [metrics, setMetrics] = useState<TradingMetrics>(initialMetrics);

  const addTask = useCallback((
    title: string,
    description: string,
    assignee: Assignee,
    priority: Task['priority'] = 'medium'
  ) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: 'todo',
      assignee,
      createdAt: new Date(),
      priority,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  }, []);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const updateMetrics = useCallback((newMetrics: Partial<TradingMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  return {
    tasks,
    metrics,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    updateMetrics,
  };
}
