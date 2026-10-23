import { Text } from 'react-native';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { useDashboard } from './useDashboard';

export default function Dashboard() {
  const states = useDashboard();
  const { styles } = states;

  const theme = useThemeValue();
  const { colors } = theme;
  return (
    <MyKeyboardAvoidingView>
      <MyScrollView>
        <Text style={{ color: colors.primary }}>Primary</Text>
        <Text style={{ color: colors.secondary }}>Secondary</Text>
        <Text style={{ color: colors.tertiary }}>Tertiary</Text>
        <Text style={{ color: colors.success }}>Success</Text>
        <Text style={{ color: colors.danger }}>Danger</Text>
        <Text style={{ color: colors.warning }}>Warning</Text>
        <Text style={{ color: colors.info }}>Info</Text>
        <Text style={{ color: colors.disabled }}>Disabled</Text>
        <Text style={{ color: colors.background }}>Background</Text>
        <Text style={{ color: colors.background2 }}>Background2</Text>
        <Text style={{ color: colors.foreground }}>Foreground</Text>
        <Text style={{ color: colors.primaryText }}>Primary Text</Text>
        <Text style={{ color: colors.border }}>Border</Text>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
