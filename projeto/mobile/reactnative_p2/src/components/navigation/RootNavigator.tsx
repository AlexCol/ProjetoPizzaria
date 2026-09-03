import { Stack } from "expo-router";
import { useAuthValue } from "../../contexts/auth/AuthContext";

export default function RootNavigator() {
  const { token } = useAuthValue();
  const isAuthenticated = Boolean(token);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(not-authenticated)" />
      </Stack.Protected>
    </Stack>
  );
}