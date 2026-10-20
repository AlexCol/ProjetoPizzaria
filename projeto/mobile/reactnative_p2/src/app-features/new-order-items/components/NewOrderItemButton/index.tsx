import { Button } from '@/src/components/base';
import { UseNewOrderItemsStates } from '../../useNewOrderItems';

type NewOrderItemButtonProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemButton({ states }: NewOrderItemButtonProps) {
  const handlePress = () => {
    //validar se há itens no pedido
  };

  return (
    <Button
      title='Avançar'
      variant='success'
      buttonPros={{
        onPress: handlePress,
      }}
    />
  );
}
