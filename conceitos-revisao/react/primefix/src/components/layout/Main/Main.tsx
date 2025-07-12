import darkModeStyles from '@/app/darkModeStyles';
import React from 'react'

function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className={mainTailwindClass}>
      {children}
    </main>
  )
}

export default Main

const mainTailwindClass = `
  h-full
`;