import { StyleSheet } from 'react-native';
import { ThemeContextType } from '@/src/contexts/theme/ThemeContext';

export default function getLoginStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    scrollView: {
      justifyContent: 'center',
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.md,
    },
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
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
    subtitle: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.lg,
    },
  });
}
