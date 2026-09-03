import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const { signIn } = useAuthValue();

  const handleSignIn = () => {
    const email = 'some email';
    const password = 'some password';
    signIn(email, password);
  };

  return (
    <View>
      <Text>login</Text>
      <TouchableOpacity onPress={handleSignIn}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  )
}