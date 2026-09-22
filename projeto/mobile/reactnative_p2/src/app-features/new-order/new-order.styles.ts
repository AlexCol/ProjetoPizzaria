import { StyleSheet } from 'react-native';
import { ThemeContextType } from '@/src/contexts/theme/ThemeContext';

export default function getNewOrderStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      color: theme.colors.primaryText,
      fontSize: 34,
      fontWeight: 'bold',
    },
    titleComplement: {
      color: theme.colors.secondary,
    },
  });
}
