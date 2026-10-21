import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { OrderItem } from '@/src/models/OrderItem';
import { numberToCurrency } from '@/src/shared/helpers';

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
          {item.amount}x - {numberToCurrency(item.product.price)}
        </Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={() => handleDeleteItem(item.id)}>
        <Feather name='trash' size={24} color={theme.colors.primaryText} />
      </Pressable>
    </View>
  );
}

const getStyles = (theme: ThemeContextType) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background2,
      borderRadius: 8,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    content: {
      flex: 1,
    },
    productName: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
    },
    productDetails: {
      color: theme.colors.border,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
  });
};
