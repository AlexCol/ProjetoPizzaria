import { Stack } from 'expo-router';

export default function NewOrderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='new-order' />
    </Stack>
  );
}
