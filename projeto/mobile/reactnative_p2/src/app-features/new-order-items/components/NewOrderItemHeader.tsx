import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { Button } from '@/src/components/base';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemHeaderProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemHeader({ states }: NewOrderItemHeaderProps) {
  const { styles, tableNumber } = states;
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Mesa {tableNumber}</Text>

        <Button
          title='Cancel'
          variant='danger'
          style={styles.cancelButton}
          buttonPros={{
            onPress: states.cancelCreation,
          }}
        >
          <Ionicons name='trash' size={24} color='white' />
        </Button>
      </View>
    </View>
  );
}
