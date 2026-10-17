import { View, Text } from 'react-native';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemSelectedItemsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectedItems({ states }: NewOrderItemSelectedItemsProps) {
  const { order } = states;
  const items = order.orderItems ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Selected Items:</Text>
      {items?.map((item) => (
        <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
          <Text>{item.product.name}</Text>
          <Text>{item.amount}</Text>
        </View>
      ))}
    </View>
  );
}
