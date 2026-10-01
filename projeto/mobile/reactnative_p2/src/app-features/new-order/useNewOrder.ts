import { RefObject, useRef } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import getNewOrderStyles from './new-order.styles';

export default function useNewOrder() {
  /****************************************************/
  /* Variaveus vindas de Hooks ou Metodos externos    */
  /****************************************************/
  const theme = useThemeValue();
  const styles = getNewOrderStyles(theme);

  /****************************************************/
  /* Refs                                             */
  /****************************************************/
  const tableNumberRef = useRef<number | null>(null); //serve pra guardar o valor
  const tableNumberInputRef = useRef<TextInput>(null) as RefObject<TextInput>; //serve pra guardar a referência do input e poder mandar comandos como focus() ou blur()

  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/
  const handleOpenTable = () => {
    if (!isValidaTable()) {
      return;
    }

    tableNumberRef.current = null;
    tableNumberInputRef.current?.clear();
    Keyboard.dismiss();
  };

  /****************************************************/
  /* Metodos Privados                                 */
  /****************************************************/
  const isValidaTable = () => {
    if (tableNumberRef.current === null || tableNumberRef.current === undefined) {
      Alert.alert('Aviso', 'Número da mesa é obrigatório.');
      return false;
    }

    const tableNumber = parseInt(tableNumberRef.current!.toString(), 10);
    if (isNaN(tableNumber)) {
      Alert.alert('Aviso', 'Número da mesa inválido.');
      return false;
    }

    if (tableNumber <= 0) {
      Alert.alert('Aviso', 'Número da mesa deve ser maior que zero.');
      return false;
    }

    return true;
  };

  return {
    styles,
    handleOpenTable,
    tableNumberRef,
    tableNumberInputRef,
  };
}
export type UseNewOrderStates = ReturnType<typeof useNewOrder>;
