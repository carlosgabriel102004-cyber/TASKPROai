
import React, { useState } from 'react';
import { Label } from '../types.ts';
import Button from './Button.tsx';
import { PRESET_COLORS } from '../constants.tsx';

interface LabelManagerProps {
  labels: Label[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({ labels, onAdd, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim(), color);
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Gerenciar Etiquetas</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da etiqueta"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-medium"
            />
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-full rounded-lg transition-transform ${color === c ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Button onClick={handleAdd} className="w-full">Adicionar Etiqueta</Button>
          </div>

          <div className="border-t border-slate-100 pt-4 max-h-60 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Etiquetas Atuais</h3>
            <div className="space-y-2">
              {labels.map(l => (
                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-sm font-bold text-slate-900">{l.name}</span>
                  </div>
                  <button onClick={() => onDelete(l.id)} className="p-1 text-slate-300 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;
