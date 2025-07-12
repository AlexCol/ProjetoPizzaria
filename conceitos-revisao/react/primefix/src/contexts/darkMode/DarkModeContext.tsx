'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
export type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    // Sincroniza classe no body ao montar e quando isDarkMode muda
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const providerValue: DarkModeContextType = { isDarkMode, toggleDarkMode };

  return (
    <DarkModeContext.Provider value={providerValue}>
      {children}
    </DarkModeContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext(DarkModeContext) diretamente. Mas sim useDarkModeValue()
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useDarkModeValue() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkModeValue must be used within a DarkModeProvider");
  }
  return context;
}
