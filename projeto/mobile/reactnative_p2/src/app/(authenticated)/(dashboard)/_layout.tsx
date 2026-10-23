import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='dashboard' />
      <Stack.Screen name='dashboard-order-items' />
    </Stack>
  );
}
