import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemButtonProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemButton({ states }: NewOrderItemButtonProps) {
  return (
    <View>
      <Text>NewOrderItemButton</Text>
    </View>
  );
}
