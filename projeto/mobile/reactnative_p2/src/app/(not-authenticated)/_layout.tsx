import { Stack } from "expo-router";

export default function NotAuthenticatedLayout() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}