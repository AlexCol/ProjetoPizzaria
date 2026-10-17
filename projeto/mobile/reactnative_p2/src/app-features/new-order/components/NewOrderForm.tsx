import { Text } from 'react-native';
import { Button, Input } from '@/src/components/base';
import { UseNewOrderStates } from '../useNewOrder';

type NewOrderFormProps = {
  states: UseNewOrderStates;
};

export default function NewOrderForm({ states }: NewOrderFormProps) {
  const { styles, handleOpenTable, isLoading } = states;
  const { tableNumberRef, tableNumberInputRef, nameRef, nameInputRef } = states;

  return (
    <>
      <Text style={styles.labelPedido}>Novo Pedido</Text>
      <Input
        ref={tableNumberInputRef}
        textInputProps={{
          placeholder: 'Numero da mesa...',
          editable: !isLoading,
          placeholderTextColor: styles.placeholder.color,
          style: styles.input,
          keyboardType: 'numeric',
          onChangeText: (text) => {
            tableNumberRef.current = text ? parseInt(text, 10) : null;
          },
        }}
      />

      <Input
        ref={nameInputRef}
        textInputProps={{
          placeholder: 'Nome do cliente (opcional)...',
          editable: !isLoading,
          placeholderTextColor: styles.placeholder.color,
          style: [styles.input, { marginTop: 16 }],
          onChangeText: (text) => {
            nameRef.current = text ? text : undefined;
          },
        }}
      />

      <Button
        title='Abrir Mesa'
        variant='default'
        loading={isLoading}
        style={styles.button}
        buttonPros={{
          onPress: handleOpenTable,
        }}
        textStyle={styles.buttonLabel}
      />
    </>
  );
}
