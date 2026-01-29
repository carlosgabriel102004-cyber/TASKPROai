
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Label, ViewType, TimeRange, Priority } from './types.ts';
import { INITIAL_LABELS, INITIAL_TASKS } from './constants.tsx';
import { isToday, isTomorrow, isPast, getLocalDateString } from './utils/dateUtils.ts';
import TaskItem from './components/TaskItem.tsx';
import AgendaView from './components/AgendaView.tsx';
import NotesView from './components/NotesView.tsx';
import TaskModal from './components/TaskModal.tsx';
import LabelManager from './components/LabelManager.tsx';
import Button from './components/Button.tsx';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks_v4_premium');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_v4_premium');
      return saved ? JSON.parse(saved) : INITIAL_LABELS;
    } catch (e) {
      return INITIAL_LABELS;
    }
  });
  
  const [viewType, setViewType] = useState<ViewType>('list');
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks_v4_premium', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('labels_v4_premium', JSON.stringify(labels));
  }, [labels]);

  const stats = useMemo(() => {
    return {
      past: tasks.filter(t => isPast(t.dueDate) && !t.completed).length,
      today: tasks.filter(t => isToday(t.dueDate) && !t.completed).length,
      tomorrow: tasks.filter(t => isTomorrow(t.dueDate) && !t.completed).length,
      upcoming: tasks.filter(t => !isPast(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate) && !t.completed).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const titleLower = (task.title || '').toLowerCase();
      const descLower = (task.description || '').toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      
      const matchesSearch = titleLower.includes(queryLower) || descLower.includes(queryLower);
      
      if (!matchesSearch) return false;
      if (activeRange === 'all') return true;

      switch (activeRange) {
        case 'today': return isToday(task.dueDate);
        case 'tomorrow': return isTomorrow(task.dueDate);
        case 'past': return isPast(task.dueDate);
        case 'upcoming': return !isPast(task.dueDate) && !isToday(task.dueDate) && !isTomorrow(task.dueDate);
        default: return true;
      }
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, activeRange, searchQuery]);

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } as Task : t));
  };

  const saveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate || getLocalDateString(),
        completed: false,
        priority: taskData.priority || Priority.MEDIUM,
        labelIds: taskData.labelIds || [],
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const toggleTask = (id: string) => updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  const deleteTask = (id: string) => {
    if (confirm('Deseja excluir esta tarefa permanentemente?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const getDefaultDate = () => {
    const d = new Date();
    if (activeRange === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (activeRange === 'past') d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  return (
    <div className="flex h-screen bg-[#fafbfc] overflow-hidden font-sans text-slate-900">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - O Coração da Navegação */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200/60 transform transition-all duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">TaskPro <span className="text-indigo-600">AI</span></h1>
          </div>

          <nav className="space-y-1 flex-grow">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">FILTROS TEMPORAIS</h3>
            
            <SidebarItem 
              active={activeRange === 'past'} 
              onClick={() => { setActiveRange('past'); setViewType('list'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Dias Passados" 
              count={stats.past}
              variant="danger"
            />
            
            <SidebarItem 
              active={activeRange === 'today'} 
              onClick={() => { setActiveRange('today'); setViewType('list'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              label="Hoje" 
              count={stats.today}
            />
            
            <SidebarItem 
              active={activeRange === 'tomorrow'} 
              onClick={() => { setActiveRange('tomorrow'); setViewType('list'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 0L8 8m4-4l4 4m-4 12v-4m0 0l4-4m-4 4l-4 4" /></svg>}
              label="Amanhã" 
              count={stats.tomorrow}
            />

            <SidebarItem 
              active={activeRange === 'upcoming'} 
              onClick={() => { setActiveRange('upcoming'); setViewType('agenda'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
              label="Próximos Dias" 
              count={stats.upcoming}
            />

            <div className="pt-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">OUTROS</h3>
              <SidebarItem 
                active={viewType === 'notes'} 
                onClick={() => { setViewType('notes'); setActiveRange('all'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                label="Notas & Detalhes" 
              />
            </div>
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => setIsLabelManagerOpen(true)}
              className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all w-full px-4 py-3 rounded-2xl hover:bg-slate-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Etiquetas
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#f8fafc]">
        <header className="px-6 md:px-10 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
               <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
               </button>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {activeRange === 'today' ? 'Foco de Hoje' : activeRange === 'tomorrow' ? 'Agenda de Amanhã' : activeRange === 'past' ? 'Histórico Pendente' : 'Próximos Passos'}
               </h2>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa ativa' : 'tarefas ativas'}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-slate-200/50 p-1 rounded-xl">
                <button onClick={() => setViewType('list')} className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                <button onClick={() => setViewType('agenda')} className={`p-2 rounded-lg transition-all ${viewType === 'agenda' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-50'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
             </div>
             <Button onClick={() => setIsTaskModalOpen(true)} className="rounded-xl px-5 py-3 shadow-lg shadow-indigo-100 font-bold">
               + NOVA TAREFA
             </Button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto px-6 md:px-10 pb-12 custom-scrollbar">
          {viewType === 'notes' ? (
            <NotesView tasks={filteredTasks} onUpdateTask={updateTask} />
          ) : viewType === 'list' ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    labels={labels} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask} 
                    onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} 
                  />
                ))
              ) : (
                <EmptyState onAction={() => setIsTaskModalOpen(true)} />
              )}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <AgendaView tasks={filteredTasks} labels={labels} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} />
            </div>
          )}
        </div>
      </main>

      {isTaskModalOpen && (
        <TaskModal 
          task={editingTask} 
          labels={labels} 
          onSave={saveTask} 
          defaultDate={getDefaultDate()} 
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} 
        />
      )}

      {isLabelManagerOpen && (
        <LabelManager 
          labels={labels} 
          onAdd={(n, c) => setLabels([...labels, { id: `l-${Date.now()}`, name: n, color: c }])} 
          onDelete={(id) => setLabels(labels.filter(l => l.id !== id))} 
          onClose={() => setIsLabelManagerOpen(false)} 
        />
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string; count?: number; variant?: string }> = ({ active, onClick, icon, label, count, variant }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1' 
        : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    <span className="flex-grow text-left truncate">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
        active ? 'bg-white/20 text-white' : (variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500')
      }`}>
        {count}
      </span>
    )}
  </button>
);

const EmptyState = ({ onAction }: { onAction: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
    <h3 className="text-lg font-bold text-slate-700">Tudo limpo por aqui!</h3>
    <p className="text-sm text-slate-400 mt-1">Nenhuma tarefa encontrada neste período.</p>
    <button onClick={onAction} className="mt-6 text-indigo-600 font-bold hover:underline">Criar algo novo</button>
  </div>
);

export default App;
