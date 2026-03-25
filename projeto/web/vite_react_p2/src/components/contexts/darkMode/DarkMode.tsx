import { ThemeProvider } from 'next-themes';
import React from 'react';

function DarkMode({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      //storageKey='dark-theme'
    >
      {children}
    </ThemeProvider>
  );
}

export default DarkMode;
