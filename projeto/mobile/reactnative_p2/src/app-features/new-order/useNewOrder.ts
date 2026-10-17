import { useRouter } from 'expo-router';
import { RefObject, useRef, useState } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { NewOrderItemPageDto } from '@/src/models/dtos/NewOrderItemPageDto';
import { postOrder } from '@/src/services/orders';
import { alertFromError } from '@/src/shared/helpers';
import getNewOrderStyles from './new-order.styles';

export default function useNewOrder() {
  /****************************************************/
  /* Variaveis vindas de Hooks ou Metodos externos    */
  /****************************************************/
  const theme = useThemeValue();
  const styles = getNewOrderStyles(theme);
  const router = useRouter();

  /****************************************************/
  /* Refs                                             */
  /****************************************************/
  const tableNumberRef = useRef<number | null>(null); //serve pra guardar o valor
  const tableNumberInputRef = useRef<TextInput>(null) as RefObject<TextInput>; //serve pra guardar a referência do input e poder mandar comandos como focus() ou blur()
  const nameRef = useRef<string | undefined>(undefined);
  const nameInputRef = useRef<TextInput>(null) as RefObject<TextInput>;
  const [isLoading, setIsLoading] = useState(false);

  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/
  const handleOpenTable = async () => {
    if (!isValidaTable()) {
      return;
    }
    try {
      setIsLoading(true);
      Keyboard.dismiss();

      const tableNumber = tableNumberRef.current!;
      const name = nameRef.current;

      const order = await postOrder({ tableNumber, name });

      tableNumberRef.current = null;
      tableNumberInputRef.current?.clear();
      nameRef.current = undefined;
      nameInputRef.current?.clear();

      const params: NewOrderItemPageDto = { orderId: order.id };
      router.push({
        pathname: '/new-order-items',
        params,
      });
    } catch (error) {
      alertFromError(error);
    } finally {
      setIsLoading(false);
    }
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
    nameRef,
    nameInputRef,
    isLoading,
  };
}
export type UseNewOrderStates = ReturnType<typeof useNewOrder>;
