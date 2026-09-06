import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children', 'style'] as const;

interface BaseTextProps {
  children: React.ReactNode;
  customStyles?: StyleProp<TextStyle>;
  textProps?: Omit<TextProps, (typeof _omittedProps)[number]>;
}

export default function BaseText({ children, customStyles, textProps }: BaseTextProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <Text style={[styles.text, customStyles]} {...textProps}>
      {children}
    </Text>
  )
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    text: {
      color: theme.colors.primaryText,
      fontSize: theme.fontSize.md,
    },
  });
}