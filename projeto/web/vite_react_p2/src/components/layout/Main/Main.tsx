import React from 'react';

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className={mainTailwindClass}>
      {children}
    </main>
  );
}

export default Main;

const mainTailwindClass = `
  flex-1
  min-h-0
  overflow-y-auto
`;
