import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemHeaderProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemHeader({ states }: NewOrderItemHeaderProps) {
  return (
    <View>
      <Text>NewOrderItemHeader</Text>
    </View>
  );
}
