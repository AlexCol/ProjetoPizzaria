import React from 'react'

function App({ children }: { children: React.ReactNode }) {

  //! aqui englobo com redux
  console.log("App component rendered");
  return (
    <>
      <header> {/*vai virar o componente header*/}
        <h1>Pizzaria Coletti</h1>
      </header>
      <main> {/*vai virar o componente main*/}
        {children}
      </main>
      <footer> {/*vai virar o componente footer*/}
        <p>© 2023 Pizzaria Coletti</p>
      </footer>
    </>
  )
}

export default App;