import { ScrollView, StyleProp, ViewStyle, ScrollViewProps, StyleSheet } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContextType, useThemeValue } from '../contexts/theme/ThemeContext';

const _omittedProps = ['children', 'contentContainerStyle', 'style'] as const;

interface MyScrollViewProps {
  children: React.ReactNode;
  customStyles?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, (typeof _omittedProps)[number]>;
}

export default function MyScrollView({
  children,
  customStyles,
  contentContainerStyle,
  scrollViewProps,
}: MyScrollViewProps) {
  const theme = useThemeValue();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  return (
    <ScrollView
      {...scrollViewProps}
      style={[styles.container, customStyles]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </ScrollView>
  );
}

function getStyles(theme: ThemeContextType, insets: EdgeInsets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },
    contentContainer: {
      justifyContent: 'center',
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
  });
}
