import { RefObject, useRef } from 'react';
import { TextInput } from 'react-native';
import { useAuthValue } from '@/src/contexts/auth/AuthContext';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import getLoginStyles from './login.styles';

export default function useLogin() {
  const { signIn, isLoading } = useAuthValue();

  const theme = useThemeValue();
  const styles = getLoginStyles(theme);

  const emailRef = useRef<string>('');
  const emailInputRef = useRef<TextInput>(null) as RefObject<TextInput>;
  const passwordRef = useRef<string>('');
  const passwordInputRef = useRef<TextInput>(null) as RefObject<TextInput>;

  const handleSignIn = async () => {
    const email = emailRef.current;
    const password = passwordRef.current;

    await signIn(email, password);
  };

  return {
    handleSignIn,
    theme,
    styles,
    isLoading,
    emailRef,
    emailInputRef,
    passwordRef,
    passwordInputRef,
  };
}
export type UseLoginStates = ReturnType<typeof useLogin>;
