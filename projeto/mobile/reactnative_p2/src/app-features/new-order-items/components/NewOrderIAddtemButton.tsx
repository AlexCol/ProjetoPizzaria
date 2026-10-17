import { Button } from '@/src/components/base';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderIAddtemButtonProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderIAddtemButton({ states }: NewOrderIAddtemButtonProps) {
  const { styles, selectedProductId, isInsertingItem, handleAddItem } = states;

  return (
    <Button
      title='Adicionar'
      variant='warning'
      style={styles.addItemButton}
      textStyle={styles.addItemText}
      buttonPros={{
        onPress: handleAddItem,
        disabled: !selectedProductId || isInsertingItem,
      }}
    />
  );
}
