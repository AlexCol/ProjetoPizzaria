import { Text, TouchableOpacityProps, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children', 'style'] as const;

interface ButtonProps {
  title: string;
  variant: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'disabled';
  loading?: boolean;
  children?: React.ReactNode;
  style?: TouchableOpacityProps['style'];
  buttonPros?: Omit<TouchableOpacityProps, (typeof _omittedProps)[number]>;
}

export default function Button(props: ButtonProps) {
  const { children, buttonPros, title, variant, loading } = props;
  const isDisabled = loading || props.buttonPros?.disabled;
  const buttonVariant = isDisabled ? 'disabled' : variant;

  const theme = useThemeValue();
  const styles = getStyles(theme, buttonVariant);

  return (
    <TouchableOpacity {...buttonPros} style={[styles.button, props.style]} disabled={isDisabled}>
      {children ??
        (loading ? <ActivityIndicator color={theme.colors.primaryText} /> : <Text style={styles.text}>{title}</Text>)}
    </TouchableOpacity>
  );
}

function getStyles(theme: ThemeContextType, variant: ButtonProps['variant']) {
  return StyleSheet.create({
    button: {
      width: '100%',
      height: 50,
      backgroundColor: variant === 'default' ? theme.colors['primary'] : theme.colors[variant],
      opacity: variant === 'disabled' ? 0.5 : 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
    },
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      width: '100%',
      textAlign: 'center',
    },
  });
}
