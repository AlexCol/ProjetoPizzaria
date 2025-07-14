import React from 'react'

function Layout({ children }: { children: React.ReactNode }) {
  console.log('Layout Page Teste renderizado');
  return (
    <>
      {children}
    </>
  )
}

export default Layout