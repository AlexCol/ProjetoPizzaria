import { BaseScrollView, BaseText, BaseTouchableOpacity } from '@/src/components/base';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';

export default function Login() {
  const { signIn } = useAuthValue();

  const handleSignIn = async () => {
    const email = 'some email';
    const password = 'some password';
    await signIn(email, password);
  };

  return (
    <BaseScrollView>
      <BaseText>login</BaseText>
      <BaseTouchableOpacity onPress={handleSignIn}>
        <BaseText>Login</BaseText>
      </BaseTouchableOpacity>
    </BaseScrollView>
  )
}