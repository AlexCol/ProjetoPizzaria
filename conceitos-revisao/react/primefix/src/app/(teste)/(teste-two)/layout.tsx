import React from 'react'

function Layout({ children }: { children: React.ReactNode }) {
  console.log('Layout Teste-Two renderizado');
  return (
    <>
      {children}
    </>
  )
}

export default Layout