import { RefObject, useRef } from 'react';
import { Alert, TextInput } from 'react-native';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { isEmail } from '@/src/shared/helpers';
import getLoginStyles from './login.styles';

export default function useLogin() {
  const { signIn, isSigningIn } = useAuthValue();

  const theme = useThemeValue();
  const styles = getLoginStyles(theme);

  const emailRef = useRef<string>('');
  const emailInputRef = useRef<TextInput>(null) as RefObject<TextInput>;
  const passwordRef = useRef<string>('');
  const passwordInputRef = useRef<TextInput>(null) as RefObject<TextInput>;

  const handleSignIn = async () => {
    const email = emailRef.current;
    const password = passwordRef.current;
    if (!areInputValids()) {
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Failed to sign in:', String(error));
    }
  };

  function areInputValids() {
    const email = emailRef.current;
    const password = passwordRef.current;

    if (!email) {
      Alert.alert('Validation Error', 'Email is required.');
      return false;
    }
    if (!isEmail(email)) {
      Alert.alert('Validation Error', 'Email is not valid.');
      return false;
    }
    if (!password) {
      Alert.alert('Validation Error', 'Password is required.');
      return false;
    }
    return true;
  }

  return {
    handleSignIn,
    theme,
    styles,
    isSigningIn,
    emailRef,
    emailInputRef,
    passwordRef,
    passwordInputRef,
  };
}
export type UseLoginStates = ReturnType<typeof useLogin>;
