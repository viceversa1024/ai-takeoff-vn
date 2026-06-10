import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameFrame } from './ui/components';
import './ui/theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameFrame>
      <App />
    </GameFrame>
  </React.StrictMode>,
);
