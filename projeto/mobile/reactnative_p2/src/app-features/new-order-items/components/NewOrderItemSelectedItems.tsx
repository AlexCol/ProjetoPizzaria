import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemSelectedItemsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectedItems({ states }: NewOrderItemSelectedItemsProps) {
  return (
    <View style={{ flex: 1 }}>
      <Text>NewOrderItemSelectors</Text>
    </View>
  );
}
