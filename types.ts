
export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  labelIds: string[];
  createdAt: string;
}

export type ViewType = 'list' | 'agenda' | 'notes';

export type TimeRange = 'past' | 'today' | 'tomorrow' | 'upcoming' | 'all';
