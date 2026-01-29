
import React from 'react';
import { Task, Label, Priority } from '../types.ts';
import { formatDate } from '../utils/dateUtils.ts';

interface TaskItemProps {
  task: Task;
  labels: Label[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, labels, onToggle, onDelete, onEdit }) => {
  const taskLabels = labels.filter(l => task.labelIds.includes(l.id));

  const priorityColors = {
    [Priority.LOW]: 'bg-blue-100 text-blue-700',
    [Priority.MEDIUM]: 'bg-amber-100 text-amber-700',
    [Priority.HIGH]: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className={`group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden ${task.completed ? 'opacity-50' : ''}`}>
      {/* Background Accent */}
      {!task.completed && task.priority === Priority.HIGH && (
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      )}
      {!task.completed && task.priority === Priority.MEDIUM && (
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
      )}
      {!task.completed && task.priority === Priority.LOW && (
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      )}

      {/* Checkbox */}
      <button 
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-50' 
            : 'border-slate-300 hover:border-indigo-400 group-hover:scale-110'
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between mb-1 gap-2">
          <h3 className={`text-[15px] font-bold text-slate-800 leading-tight truncate ${task.completed ? 'line-through decoration-slate-400 decoration-2' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <p className={`text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed ${task.completed ? 'opacity-50' : ''}`}>
          {task.description || "Sem descrição adicional."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          
          <div className="flex items-center text-[11px] text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.dueDate)}
          </div>

          <div className="flex -space-x-1 ml-auto">
            {taskLabels.map(l => (
              <div 
                key={l.id} 
                className="w-3.5 h-3.5 rounded-full border-2 border-white ring-1 ring-slate-100" 
                style={{ backgroundColor: l.color }}
                title={l.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
