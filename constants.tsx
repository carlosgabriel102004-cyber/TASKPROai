
import React from 'react';
import { Label, Priority } from './types.ts';

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', 
  '#64748b', '#06b6d4'
];

export const INITIAL_LABELS: Label[] = [
  { id: 'l1', name: 'Trabalho', color: '#3b82f6' },
  { id: 'l2', name: 'Pessoal', color: '#10b981' },
  { id: 'l3', name: 'Urgente', color: '#ef4444' },
];

export const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Finalizar relatório mensal',
    description: 'Revisar métricas de vendas e KPIs do mês passado.',
    dueDate: new Date().toISOString(),
    completed: false,
    priority: Priority.HIGH,
    labelIds: ['l1', 'l3'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Comprar mantimentos',
    description: 'Frutas, legumes e leite.',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completed: false,
    priority: Priority.MEDIUM,
    labelIds: ['l2'],
    createdAt: new Date().toISOString()
  }
];
