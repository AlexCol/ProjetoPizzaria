'use client';
import { AuthProvider } from '@/components/contexts/auth/AuthContext';
import ToastContext from '@/components/contexts/toast/ToastContext';
import React from 'react';

function App({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastContext>
        {children}
      </ToastContext>
    </AuthProvider>
  )
}

export default App;