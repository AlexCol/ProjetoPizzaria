import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { colorsByTheme, ThemeColors } from "./constants/colors";
import { BorderRadius, FontSize, Spacing } from "./constants/types";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
export type ThemeContextType = {
  colors: ThemeColors;
  toggleTheme: () => void;
  spacing: Spacing;
  borderRadius: BorderRadius;
  fontSize: FontSize;
};

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? colorsByTheme.dark : colorsByTheme.light;

  const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  };

  useEffect(() => {

  }, []); //carrega os dados do usuário do AsyncStorage quando o componente é montado

  const providerValue: ThemeContextType = {
    colors: colors,
    toggleTheme: () => setIsDark(!isDark),
    spacing: spacing,
    borderRadius: borderRadius,
    fontSize: fontSize,
  };

  return (
    <ThemeContext.Provider value={providerValue}>
      {children}
    </ThemeContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext(AuthContext) diretamente. Mas sim useAuthValue()
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useThemeValue() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeValue must be used within a ThemeProvider");
  }
  return context;
}
