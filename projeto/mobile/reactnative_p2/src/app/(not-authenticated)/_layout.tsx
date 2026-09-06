import { Stack } from "expo-router";
import { ThemeContextType, useThemeValue } from "@/src/contexts/theme/ThemeContext";

export default function NotAuthenticatedLayout() {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  return (
    <Stack screenOptions={{ headerStyle: styles.header, headerTitleStyle: styles.headerTitle }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}

function getStyles(theme: ThemeContextType) {
  return {
    tabBar: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.border,
    },
    header: {
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      color: theme.colors.primaryText,
    }
  };
}