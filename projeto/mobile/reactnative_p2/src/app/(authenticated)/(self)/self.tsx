import { Text } from 'react-native';
import { Button } from '@/src/components/base';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';

export default function Self() {
  const { signOut, session } = useAuthValue();
  const theme = useThemeValue();

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView>
        <Text>Self</Text>
        <Text>{session!.user.name}</Text>
        <Button
          title='Sair'
          variant='danger'
          buttonPros={{
            onPress: signOut,
          }}
        />

        <Button
          title='Toggle Theme'
          variant='info'
          buttonPros={{
            onPress: theme.toggleTheme,
          }}
        />
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
