import { View } from 'react-native';
import { LoginButton, LoginHeader, LoginInputs, useLogin } from '@/src/app-features/login';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';

export default function Login() {
  const states = useLogin();
  const { styles } = states;

  return (
    <MyKeyboardAvoidingView>
      <MyScrollView>
        <LoginHeader states={states} />
        <View style={styles.form}>
          <LoginInputs states={states} />
          <LoginButton states={states} />
        </View>
      </MyScrollView>
    </MyKeyboardAvoidingView>
  );
}
