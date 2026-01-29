
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Log de depuração silencioso
console.log('TaskPro AI: Inicializando módulo principal...');

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Erro: Elemento #root não encontrado no DOM.');
}
