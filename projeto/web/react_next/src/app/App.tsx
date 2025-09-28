'use client';
import { AuthProvider } from '@/components/contexts/auth/AuthContext';
import { SocketProvider } from '@/components/contexts/socket/SocketContext';
import ToastContext from '@/components/contexts/toast/ToastContext';
import React from 'react';

function App({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastContext>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ToastContext>
    </AuthProvider>
  )
}

export default App;