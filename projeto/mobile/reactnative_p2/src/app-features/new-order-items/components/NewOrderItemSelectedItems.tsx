import { View, Text } from 'react-native';
import MyScrollView from '@/src/components/MyScrollView';
import { UseNewOrderItemsStates } from '../useNewOrderItems';
import NewOrderItem from './NewOrderItem';

type NewOrderItemSelectedItemsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectedItems({ states }: NewOrderItemSelectedItemsProps) {
  const { order, handleDeleteItem, styles } = states;
  const items = order.orderItems ?? [];

  return (
    <MyScrollView contentContainerStyle={styles.itemsContainer}>
      {items.length === 0 && <Text style={styles.itemsTitle}>Nenhum item adicionado.</Text>}

      {items.length > 0 && (
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Adicionados:</Text>

          {items?.map((item) => (
            <NewOrderItem key={item.id} handleDeleteItem={handleDeleteItem} item={item} />
          ))}
        </View>
      )}
    </MyScrollView>
  );
}
