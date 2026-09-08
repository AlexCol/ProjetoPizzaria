import { BaseScrollView, BaseText, BaseTouchableOpacity } from '@/src/components/base';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';

export default function Dashboard() {
  const { signOut } = useAuthValue();
  const theme = useThemeValue();

  return (
    <BaseScrollView>
      <BaseText>dashboard</BaseText>
      <BaseTouchableOpacity onPress={signOut}>
        <BaseText>Sign Out</BaseText>
      </BaseTouchableOpacity>

      <BaseTouchableOpacity onPress={theme.toggleTheme}>
        <BaseText>Toggle Theme</BaseText>
      </BaseTouchableOpacity>
    </BaseScrollView>
  );
}
