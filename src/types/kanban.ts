export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

export type Assignee = 'user' | 'Crypto_Chad';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: Assignee;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface TradingMetrics {
  totalProfit: number;
  profitYesterday: number;
  profitWeek: number;
  winRateTotal: number;
  winRateYesterday: number;
  winRateWeek: number;
  tradesTotal: number;
  tradesYesterday: number;
  tradesWeek: number;
  avgTradeSize: number;
  maxDrawdown: number;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
