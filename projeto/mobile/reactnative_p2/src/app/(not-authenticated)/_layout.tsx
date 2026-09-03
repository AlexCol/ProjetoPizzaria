import { Stack } from "expo-router";

export default function NotAuthenticatedLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" />
    </Stack>
  );
}

