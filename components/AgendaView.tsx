
import React from 'react';
import { Task, Label } from '../types.ts';
import TaskItem from './TaskItem.tsx';
import { formatFullDate } from '../utils/dateUtils.ts';

interface AgendaViewProps {
  tasks: Task[];
  labels: Label[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ tasks, labels, onToggle, onDelete, onEdit }) => {
  const groups: Record<string, Task[]> = {};
  tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).forEach(task => {
    const dateKey = task.dueDate.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
  });

  const sortedDates = Object.keys(groups).sort();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">Nenhuma tarefa encontrada para este período</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {sortedDates.map(date => (
        <div key={date} className="relative">
          <div className="sticky top-0 z-10 bg-[#f8fafc]/80 backdrop-blur-sm py-3 mb-4">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              {formatFullDate(date)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-slate-100">
            {groups[date].map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                labels={labels} 
                onToggle={onToggle} 
                onDelete={onDelete} 
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaView;
