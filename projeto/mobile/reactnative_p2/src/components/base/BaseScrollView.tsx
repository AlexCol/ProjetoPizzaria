import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children', 'style'] as const;

interface BaseViewProps {
  children: React.ReactNode;
  customStyles?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, (typeof _omittedProps)[number]>;
}

export default function BaseScrollView({ children, customStyles, scrollViewProps }: BaseViewProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <ScrollView style={[styles.container, customStyles]} {...scrollViewProps}>
      {children}
    </ScrollView>
  )
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
  });
}