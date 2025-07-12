import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import { DarkModeProvider } from '@/contexts/darkMode/DarkModeContext';
import React, { ReactNode } from 'react'

function App({ children, }: Readonly<{ children: ReactNode }>) {
  return (
    <DarkModeProvider>
      {/*aqui pode ser adicionado navBar para ser comum a tudo (mesmo a pagina de não encontrado)*/}
      <Header />
      <Main>{children}</Main>
      <Footer />
    </DarkModeProvider>
  )
}

export default App;

/*
<header> – cabeçalho (pode conter logo, menu, etc.)
<nav> – navegação principal ou secundária
<main> – conteúdo principal da página (apenas uma por página)
<section> – seções temáticas ou agrupamentos
<article> – conteúdo independente (post de blog, notícia, etc.)
<aside> – conteúdo lateral (relacionado ou extra)
<footer> – rodapé
*/