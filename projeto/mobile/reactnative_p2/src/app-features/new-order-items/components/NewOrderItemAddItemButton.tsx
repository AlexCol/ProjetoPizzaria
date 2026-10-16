import { Text } from 'react-native';
import MyScrollView from '@/src/components/MyScrollView';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemAddItemButtonProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemAddItemButton({ states }: NewOrderItemAddItemButtonProps) {
  return (
    <MyScrollView contentContainerStyle={states.styles.newOrderAddItemButtonContainer}>
      <Text style={{ color: 'white' }}>NewOrderItemAddItemButton</Text>
    </MyScrollView>
  );
}
