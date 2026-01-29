
import React, { useState, useEffect } from 'react';
import { Task, Label, Priority } from '../types.ts';
import Button from './Button.tsx';
import { analyzeTaskPrompt } from '../services/geminiService.ts';

interface TaskModalProps {
  task?: Task | null;
  labels: Label[];
  defaultDate?: string;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, labels, defaultDate, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : (defaultDate || new Date().toISOString().split('T')[0]));
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labelIds || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      dueDate: dueDate,
      priority,
      labelIds: selectedLabels,
      completed: task?.completed || false,
    });
  };

  const handleSmartAnalyze = async () => {
    if (!title) return;
    setIsAnalyzing(true);
    const result = await analyzeTaskPrompt(title);
    if (result) {
      if (result.suggestedPriority) {
        const p = result.suggestedPriority.toLowerCase();
        if (p.includes('alta')) setPriority(Priority.HIGH);
        else if (p.includes('baixa')) setPriority(Priority.LOW);
        else setPriority(Priority.MEDIUM);
      }
      alert(`Sugestão da IA: Prioridade ${result.suggestedPriority}. Tempo est.: ${result.estimatedMinutes}min`);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Título</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O que precisa ser feito?"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-950 font-semibold"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleSmartAnalyze} 
                  disabled={isAnalyzing || !title}
                  title="Analisar com IA"
                  className="px-3"
                >
                  {isAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes adicionais..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all h-24 resize-none text-slate-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Data de Entrega</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-950 font-bold appearance-none cursor-pointer"
                >
                  <option value={Priority.LOW}>Baixa</option>
                  <option value={Priority.MEDIUM}>Média</option>
                  <option value={Priority.HIGH}>Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {labels.map(l => {
                  const isSelected = selectedLabels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLabels(prev => 
                          prev.includes(l.id) ? prev.filter(id => id !== l.id) : [...prev, l.id]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all shadow-sm ${
                        isSelected 
                          ? 'border-slate-950 ring-1 ring-slate-950 ring-offset-1' 
                          : 'bg-white border-slate-200 hover:bg-slate-100'
                      } text-slate-950`}
                      style={{ 
                        backgroundColor: isSelected ? l.color : 'white',
                      }}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" className="flex-1 text-slate-950 font-bold" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 font-bold">Salvar Tarefa</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
