import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);