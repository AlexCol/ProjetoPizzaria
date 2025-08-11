import { useEffect, useRef } from "react";

/**
 * Hook para escutar alterações em uma chave específica do localStorage,
 * detectando mudanças feitas na mesma aba (via código ou manualmente no DevTools)
 * e em outras abas/janelas.
 * 
 * @param key chave do localStorage a ser observada
 * @param callback função chamada com o novo valor (string|null) sempre que o valor mudar
 */
export function useLocalStorageListener(
  key: string,
  callback: (newValue: string | null) => void
) {
  const callbackRef = useRef(callback);
  // Mantém a referência da callback atualizada para evitar re-subscription desnecessária
  callbackRef.current = callback;

  // Guarda o último valor conhecido para comparação e evitar chamadas repetidas do callback
  const lastValueRef = useRef<string | null>(null);

  useEffect(() => {
    // Inicializa o valor guardado com o valor atual do localStorage na chave observada
    lastValueRef.current = localStorage.getItem(key);

    // === Interceptação dos métodos nativos do localStorage ===
    // Sobrescreve localStorage.setItem para detectar alterações via código na mesma aba
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      if (k === key && v !== lastValueRef.current) {
        lastValueRef.current = v;
        callbackRef.current(v);
      }
      return originalSetItem.apply(this, [k, v]);
    };

    // Sobrescreve localStorage.removeItem para detectar remoções via código na mesma aba
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function (k) {
      if (k === key && lastValueRef.current !== null) {
        lastValueRef.current = null;
        callbackRef.current(null);
      }
      return originalRemoveItem.apply(this, [k]);
    };

    // === Listener do evento storage para detectar alterações em outras abas/janelas ===
    function onStorage(event: StorageEvent) {
      if (event.key === key && event.newValue !== lastValueRef.current) {
        lastValueRef.current = event.newValue;
        callbackRef.current(event.newValue ?? '_');
      }
    }

    window.addEventListener("storage", onStorage);

    // === Polling para detectar alterações manuais feitas no DevTools na mesma aba ===
    // Única forma confiável para capturar mudanças manuais, já que o evento 'storage' 
    // não é disparado para alterações na mesma aba e o DevTools não usa os métodos JS.
    // const interval = setInterval(() => {
    //   const currentValue = localStorage.getItem(key);
    //   if (currentValue !== lastValueRef.current) {
    //     lastValueRef.current = currentValue;
    //     callbackRef.current(currentValue);
    //   }
    // }, 10000); // intervalo de 1 segundo para equilibrar reatividade e desempenho

    // Cleanup ao desmontar o hook
    return () => {
      // Restaura os métodos originais do localStorage
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;

      // Remove listener do evento storage
      window.removeEventListener("storage", onStorage);

      // Para o polling
      // clearInterval(interval);
    };
  }, [key]);
}
