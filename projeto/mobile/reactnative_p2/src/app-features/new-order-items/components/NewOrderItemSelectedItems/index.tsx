import { View, Text } from 'react-native';
import MyScrollView from '@/src/components/MyScrollView';
import { UseNewOrderItemsStates } from '../../useNewOrderItems';
import NewOrderItem from './NewOrderItem';

type NewOrderItemSelectedItemsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectedItems({ states }: NewOrderItemSelectedItemsProps) {
  const { order, handleDeleteItem, styles } = states;
  const items = order.orderItems ?? [];

  return (
    <View style={styles.itemsArea}>
      <Text style={styles.itemsTitle}>{items.length === 0 ? 'Nenhum item adicionado.' : 'Itens Adicionados:'}</Text>

      {items.length > 0 && (
        <MyScrollView
          contentContainerStyle={styles.itemsContainer}
          scrollViewProps={{ showsVerticalScrollIndicator: false }}
        >
          <View style={styles.itemsSection}>
            {items.map((item) => (
              <NewOrderItem key={item.id} handleDeleteItem={handleDeleteItem} item={item} />
            ))}
          </View>
        </MyScrollView>
      )}
    </View>
  );
}
