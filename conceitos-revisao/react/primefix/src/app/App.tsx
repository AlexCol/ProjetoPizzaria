'use client';
import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import { Loading } from '@/components/loading/Loading';
import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext';
import React, { ReactNode, useEffect, useState } from 'react'

function App({ children, }: Readonly<{ children: ReactNode }>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // 1000ms delay
    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {/*aqui pode ser adicionado navBar para ser comum a tudo (mesmo a pagina de não encontrado)*/}
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
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