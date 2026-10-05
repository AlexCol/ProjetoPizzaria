import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemSelectorsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectors({ states }: NewOrderItemSelectorsProps) {
  return (
    <View>
      <Text>NewOrderItemSelectors</Text>
    </View>
  );
}
