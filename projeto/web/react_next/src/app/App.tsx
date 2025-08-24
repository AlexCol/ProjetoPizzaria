'use client';
import { AuthProvider } from '@/components/contexts/auth/AuthContext';
import React from 'react';

function App({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export default App;