import { Text } from 'react-native';
import { Button, Input } from '@/src/components/base';
import { UseNewOrderStates } from '../useNewOrder';

type NewOrderFormProps = {
  states: UseNewOrderStates;
};

export default function NewOrderForm({ states }: NewOrderFormProps) {
  const { styles, handleOpenTable } = states;
  const { tableNumberRef, tableNumberInputRef } = states;
  return (
    <>
      <Text style={styles.label}>Novo Pedido</Text>
      <Input
        ref={tableNumberInputRef}
        textInputProps={{
          placeholder: 'Numero da mesa...',
          placeholderTextColor: styles.placeholder.color,
          style: styles.input,
          keyboardType: 'numeric',
          onChangeText: (text) => {
            tableNumberRef.current = text ? parseInt(text, 10) : null;
          },
        }}
      />

      <Button
        title='Abrir Mesa'
        variant='default'
        style={styles.button}
        buttonPros={{
          onPress: handleOpenTable,
        }}
      />
    </>
  );
}
