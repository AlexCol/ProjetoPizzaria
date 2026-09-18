import { View } from 'react-native';
import MyKeyboardAvoidingView from '@/src/components/MyKeyboardAvoidingView';
import MyScrollView from '@/src/components/MyScrollView';
import LoginButton from './components/LoginButton';
import LoginHeader from './components/LoginHeader';
import LoginInputs from './components/LoginInputs';
import useLogin from './useLogin';

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
