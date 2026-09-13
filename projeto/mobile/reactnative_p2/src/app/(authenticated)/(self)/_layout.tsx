import { Stack } from 'expo-router';

export default function SelfLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='self' />
    </Stack>
  );
}
