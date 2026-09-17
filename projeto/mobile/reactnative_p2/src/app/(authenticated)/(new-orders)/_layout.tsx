import { NativeStackNavigationOptions, Stack } from 'expo-router';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';

export default function DashboardLayout() {
  const { colors } = useThemeValue();

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: 'fade',
    contentStyle: {
      backgroundColor: colors.background,
    },
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name='new-order' />
    </Stack>
  );
}
