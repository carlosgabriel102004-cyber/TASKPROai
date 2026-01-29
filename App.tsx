
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
      const saved = localStorage.getItem('tasks_v4');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_v4');
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
    localStorage.setItem('tasks_v4', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('labels_v4', JSON.stringify(labels));
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
      // Prioritize non-completed tasks
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
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const getDefaultDate = () => {
    const d = new Date();
    if (activeRange === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (activeRange === 'past') d.setDate(d.getDate() - 1);
    else if (activeRange === 'upcoming') d.setDate(d.getDate() + 2);
    return getLocalDateString(d);
  };

  return (
    <div className="flex h-screen bg-[#fafbfc] overflow-hidden font-sans text-slate-900">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-all duration-300" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-white border-r border-slate-200/60 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight tracking-tight">TaskPro <span className="text-indigo-600">AI</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organização Elite</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-4 flex items-center justify-between">
                <span>Cronograma</span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              </h3>
              
              <SidebarItem 
                active={activeRange === 'past'} 
                onClick={() => { setActiveRange('past'); setViewType('list'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></svg>}
                label="Dias Passados" 
                count={stats.past}
                variant="danger"
              />
              
              <SidebarItem 
                active={activeRange === 'today'} 
                onClick={() => { setActiveRange('today'); setViewType('list'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /></svg>}
                label="Hoje" 
                count={stats.today}
              />
              
              <SidebarItem 
                active={activeRange === 'tomorrow'} 
                onClick={() => { setActiveRange('tomorrow'); setViewType('list'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>}
                label="Amanhã" 
                count={stats.tomorrow}
              />
              
              <SidebarItem 
                active={activeRange === 'upcoming'} 
                onClick={() => { setActiveRange('upcoming'); setViewType('agenda'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m15 14 3 3-3 3" /></svg>}
                label="Próximos Dias" 
                count={stats.upcoming}
              />
            </div>

            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Workspace</h3>
              <SidebarItem 
                active={viewType === 'notes'} 
                onClick={() => { setViewType('notes'); setActiveRange('all'); setMobileMenuOpen(false); }} 
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg>}
                label="Notas & Detalhes" 
              />
            </div>
          </nav>

          {/* Footer Sidebar */}
          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => setIsLabelManagerOpen(true)}
              className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all w-full px-4 py-3 rounded-2xl hover:bg-slate-50 group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              Gerenciar Etiquetas
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 md:px-12 py-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6 flex-grow">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {viewType === 'notes' ? 'Minhas Notas' : (activeRange === 'today' ? 'Foco de Hoje' : activeRange === 'tomorrow' ? 'Agenda de Amanhã' : activeRange === 'past' ? 'Histórico Pendente' : 'Próximos Dias')}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
              </p>
            </div>

            <div className="max-w-md w-full relative group ml-auto md:ml-0">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar tarefas..."
                className="w-full pl-12 pr-6 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="hidden sm:flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-xl transition-all ${viewType === 'list' ? 'bg-white shadow-md shadow-slate-200 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                title="Lista"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button 
                onClick={() => setViewType('agenda')}
                className={`p-2 rounded-xl transition-all ${viewType === 'agenda' ? 'bg-white shadow-md shadow-slate-200 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                title="Agenda"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
            
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              <span>NOVA TAREFA</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-12 custom-scrollbar scroll-smooth">
          {viewType === 'notes' ? (
            <NotesView tasks={filteredTasks} onUpdateTask={updateTask} />
          ) : viewType === 'list' ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
            <div className="max-w-6xl mx-auto pb-20">
              <AgendaView tasks={filteredTasks} labels={labels} onToggle={toggleTask} onDelete={deleteTask} onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  variant?: 'default' | 'danger';
}

const SidebarItem: React.FC<SidebarItemProps> = ({ active, onClick, icon, label, count, variant = 'default' }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:pl-5'
    }`}
  >
    <span className={`${active ? 'text-indigo-600' : 'text-slate-400'} flex-shrink-0`}>{icon}</span>
    <span className="flex-grow text-left tracking-tight whitespace-nowrap">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider ${
        variant === 'danger' && !active ? 'bg-red-50 text-red-500' : 
        active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const EmptyState: React.FC<{ onAction: () => void }> = ({ onAction }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-inner shadow-slate-200">
      <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Nada para mostrar</h3>
    <p className="text-slate-500 mt-2 max-w-[280px] font-medium">Sua lista está limpa. Que tal planejar algo novo para este período?</p>
    <button 
      onClick={onAction}
      className="mt-8 text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-8 decoration-2 decoration-indigo-200 hover:decoration-indigo-500 transition-all"
    >
      Criar minha primeira tarefa
    </button>
  </div>
);

export default App;
