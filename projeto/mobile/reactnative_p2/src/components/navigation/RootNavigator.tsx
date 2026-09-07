import { NativeStackNavigationOptions, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useThemeValue } from "@/src/contexts/theme/ThemeContext";
import { useAuthValue } from "../../contexts/auth/AuthContext";
import Loader from "../Loader";

export default function RootNavigator() {
  const { token, isLoading } = useAuthValue();
  const { isDark, colors } = useThemeValue();
  const isAuthenticated = Boolean(token);

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: 'fade',
    contentStyle: {
      backgroundColor: colors.background,
    },
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={screenOptions}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(authenticated)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(not-authenticated)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
