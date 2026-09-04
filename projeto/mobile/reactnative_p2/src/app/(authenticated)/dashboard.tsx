import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const { signOut } = useAuthValue();
  const theme = useThemeValue();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>dashboard</Text>
      <TouchableOpacity onPress={signOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={theme.toggleTheme} style={styles.button}>
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  )
}

function getStyles(theme: ThemeContextType) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
  };
}