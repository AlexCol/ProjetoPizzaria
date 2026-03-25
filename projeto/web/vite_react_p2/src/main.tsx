import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './components/contexts/auth/AuthContext.tsx';
import DarkMode from './components/contexts/darkMode/DarkMode.tsx';
import { SseProvider } from './components/contexts/sse/SSEContext.tsx';
import ToasterConfig from './components/singles/ToasterConfig/index.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToasterConfig />
    <SseProvider>
      <AuthProvider>
        <DarkMode>
          <App />
        </DarkMode>
      </AuthProvider>
    </SseProvider>
  </StrictMode>,
);
