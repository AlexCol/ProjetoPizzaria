'use client';
import { AuthProvider } from '@/components/contexts/auth/AuthContext';
import { store } from '@/redux/store';
import React from 'react'
import { Provider } from 'react-redux';

function App({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  )
}

export default App;