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

    label: {
      fontSize: theme.fontSize.xl,
      color: theme.colors.primaryText,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    input: {
      marginBottom: theme.spacing.sm,
    },
    placeholder: {
      color: theme.colors.border,
    },
  });
}
