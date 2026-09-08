import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContextType, useThemeValue } from '@/src/contexts/theme/ThemeContext';

const _omittedProps = ['children', 'contentContainerStyle', 'style'] as const;

interface BaseViewProps {
  children: React.ReactNode;
  customStyles?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, (typeof _omittedProps)[number]>;
}

export default function BaseScrollView({
  children,
  customStyles,
  contentContainerStyle,
  scrollViewProps,
}: BaseViewProps) {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <ScrollView
      {...scrollViewProps}
      style={[styles.container, customStyles]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}

function getStyles(theme: ThemeContextType) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },
    contentContainer: {
      padding: theme.spacing.md,
    },
  });
}
