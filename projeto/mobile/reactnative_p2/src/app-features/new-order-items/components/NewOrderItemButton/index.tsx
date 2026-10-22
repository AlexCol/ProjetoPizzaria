import { Button } from '@/src/components/base';
import { UseNewOrderItemsStates } from '../../useNewOrderItems';

type NewOrderItemButtonProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemButton({ states }: NewOrderItemButtonProps) {
  const { sendOrderToKitchen } = states;

  return (
    <Button
      title='Finalizar Pedido'
      variant='success'
      buttonPros={{
        onPress: sendOrderToKitchen,
      }}
    />
  );
}
