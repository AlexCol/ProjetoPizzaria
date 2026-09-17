import { StyleSheet } from 'react-native';
import { ThemeContextType } from '@/src/contexts/theme/ThemeContext';

export default function getNewOrderStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
}
