import { StyleProp, StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children', 'style', 'onPress'] as const;

interface BaseTouchableOpacityProps {
  children: React.ReactNode;
  onPress?: () => void;
  customStyles?: StyleProp<ViewStyle>;
  touchableOpacityProps?: Omit<TouchableOpacityProps, (typeof _omittedProps)[number]>;
}

export default function BaseTouchableOpacity({ children, customStyles, onPress, touchableOpacityProps }: BaseTouchableOpacityProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, customStyles]} {...touchableOpacityProps}>
      {children}
    </TouchableOpacity>
  )
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
  });
}
