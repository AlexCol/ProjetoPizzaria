import { Text, TouchableOpacityProps, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children'] as const;

interface ButtonProps {
  title: string;
  variant: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'disabled';
  loading?: boolean;
  children?: React.ReactNode;
  buttonPros?: Omit<TouchableOpacityProps, (typeof _omittedProps)[number]>;
}

export default function Button(props: ButtonProps) {
  const { children, buttonPros, title, variant, loading } = props;

  const theme = useThemeValue();
  const styles = getStyles(theme, variant);

  return (
    <TouchableOpacity {...buttonPros} style={styles.button}>
      {
        children ??
        <Text style={styles.text}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

function getStyles(theme: ThemeContextType, variant: ButtonProps['variant']) {
  return StyleSheet.create({
    button: {
      backgroundColor: variant === 'default' ? theme.colors['primary'] : theme.colors[variant],
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
  });
}