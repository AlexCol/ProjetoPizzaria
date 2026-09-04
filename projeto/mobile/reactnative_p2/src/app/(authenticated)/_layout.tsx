import { ThemeContextType, useThemeValue } from "@/src/contexts/theme/ThemeContext";
import { Tabs } from "expo-router";
import { BottomTabNavigationOptions } from "expo-router/build/react-navigation/bottom-tabs";
// import { Stack } from "expo-router";

// export default function AuthenticatedLayout() {
//   return (
//     <Stack>
//       <Stack.Screen name="dashboard" />
//     </Stack>
//   );
// }

export default function Layout() {
  const theme = useThemeValue();
  const styles = getStyles(theme);

  const defaultOptions: BottomTabNavigationOptions = {
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
  }

  return (
    <Tabs screenOptions={{ tabBarStyle: styles.tabBar }}>
      <Tabs.Screen name="dashboard" options={{ title: "Início", ...defaultOptions }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos", ...defaultOptions }} />
    </Tabs>
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