import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { OrderItem } from '@/src/models/OrderItem';

type NewOrderItemProps = {
  handleDeleteItem: (id: string) => Promise<void>;
  item: OrderItem;
};

export default function NewOrderItem({ handleDeleteItem, item }: NewOrderItemProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productDetails}>
          {item.amount}x - {item.product.price}
        </Text>
        <Text onPress={() => handleDeleteItem(item.id)}>
          <Feather name='trash-2' size={24} color={theme.colors.danger} />
        </Text>
      </View>
    </View>
  );
}

const getStyles = (theme: ThemeContextType) => {
  return StyleSheet.create({
    container: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productName: {
      fontWeight: 'bold',
      color: theme.colors.primaryText,
    },
    productDetails: {
      color: theme.colors.primaryText,
    },
  });
};
