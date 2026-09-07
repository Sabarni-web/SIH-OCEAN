import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'

// Suppress specific Three.js warnings from cluttering the console
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('THREE.Clock: This module has been deprecated')) return;
  if (msg.includes('THREE.WebGLProgram: Program Info Log') && msg.includes('warning X4122')) return;
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
