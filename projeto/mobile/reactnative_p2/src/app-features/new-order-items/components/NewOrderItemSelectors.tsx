import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemSelectorsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectors({ states }: NewOrderItemSelectorsProps) {
  return (
    <View style={{ flex: 1 }}>
      <Text>NewOrderItemSelectors</Text>
    </View>
  );
}
