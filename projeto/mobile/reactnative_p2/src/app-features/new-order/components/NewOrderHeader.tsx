import { View, Text } from 'react-native';
import { UseNewOrderStates } from '../useNewOrder';

type NewOrderHeaderProps = {
  states: UseNewOrderStates;
};

export default function NewOrderHeader({ states }: NewOrderHeaderProps) {
  const { styles } = states;
  return (
    <View style={styles.header}>
      <Text style={[styles.title]}>
        Pizzaria
        <Text style={[styles.titleComplement]}>Coletti</Text>
      </Text>
    </View>
  );
}
