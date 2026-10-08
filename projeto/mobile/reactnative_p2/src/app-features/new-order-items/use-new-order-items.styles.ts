import { StyleSheet } from 'react-native';
import { ThemeContextType } from '@/src/contexts/theme/ThemeContext';

export default function getNewOrderItemsStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    header: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingTop: theme.insets.top + 8,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: 'bold',
      color: theme.colors.primaryText,
    },
    cancelButton: {
      width: '20%',
    },

    selectContainer: {
      marginVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      flexGrow: 0,
      justifyContent: 'flex-start',
    },
  });
}
