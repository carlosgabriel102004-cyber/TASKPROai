
import React, { useState } from 'react';
import { Task, Priority } from '../types.ts';
import Button from './Button.tsx';

interface NotesViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ tasks, onUpdateTask }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  };

  const handleSave = (id: string) => {
    onUpdateTask(id, { title: editTitle, description: editDesc });
    setEditingId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-lg font-medium">Nenhuma nota para exibir</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-32">
      {tasks.map(task => {
        const isEditing = editingId === task.id;

        return (
          <article key={task.id} className="group relative bg-white md:bg-transparent md:p-0 p-6 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-100 md:border-0 md:border-b md:border-slate-100 pb-12 last:border-0">
            {isEditing ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-3xl font-black text-slate-900 bg-slate-50 border-none focus:ring-0 rounded-lg px-2 outline-none"
                    placeholder="Título da Nota"
                    autoFocus
                  />
                </div>
                <div className="pl-4">
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full min-h-[300px] text-xl text-slate-700 bg-slate-50 border-none focus:ring-0 rounded-xl p-4 leading-relaxed outline-none resize-y"
                    placeholder="Escreva seus detalhes aqui com todo o espaço que precisar..."
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="font-bold">Cancelar</Button>
                    <Button onClick={() => handleSave(task.id)} className="px-8 font-black">Salvar Alterações</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-8 rounded-full ${task.completed ? 'bg-slate-300' : 'bg-indigo-500'}`} />
                    <h2 className={`text-3xl font-black text-slate-900 tracking-tight ${task.completed ? 'line-through opacity-40' : ''}`}>
                      {task.title}
                    </h2>
                  </div>
                  <button 
                    onClick={() => startEditing(task)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="pl-4 border-l-2 border-slate-50 ml-0.5 cursor-pointer" onClick={() => startEditing(task)}>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-xl font-medium">
                    {task.description || "Esta tarefa não possui uma descrição detalhada. Clique para adicionar."}
                  </p>
                  <div className="mt-8 flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {task.completed && (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Concluída</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
    </div>
  );
};

export default NotesView;
