'use client';

import { createContext, ReactNode, use, useContext, useEffect, useState } from "react";

//*************************************************************
//* Metodo de States do Provider e obter sua Tipagem
//*************************************************************
function darkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    setDarkModePreference(!isDarkMode);
  };

  useEffect(() => {
    const preference = getDarkModePreference();
    setIsDarkMode(preference);
  }, []);

  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
}

type DarkModeContextType = ReturnType<typeof darkMode>;

//*************************************************************
//* Criando o contexto, com base no tipo acima
//* Não exportando, de modo a forçar o uso de useDarkModeContext
//*************************************************************
const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function DarkModeProvider({ children }: { children: ReactNode }) {
  return (
    <DarkModeContext.Provider value={darkMode()}>
      {children}
    </DarkModeContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext(DarkModeContext) diretamente. Mas sim useDarkModeValue()
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useDarkModeContext() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkModeContext must be used within a DarkModeProvider");
  }
  return context;
}

//*************************************************************
//* Metodos auxiliares para o Dark Mode, para não deixar
//* eles no export e visiveis para outros componentes
//*************************************************************
function setDarkMode(isDarkMode: boolean) {
  if (isDarkMode) {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
}

function getDarkModePreference(): boolean {
  // Verifica se o localStorage tem a preferência do usuário
  const storedPreference = localStorage.getItem('darkMode');
  if (storedPreference) {
    return JSON.parse(storedPreference);
  }

  // Verifica se o usuário prefere o modo escuro
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Retorna a preferência do usuário
  return prefersDark;
}

function setDarkModePreference(isDarkMode: boolean) {
  // Salva a preferência do usuário no localStorage
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
}