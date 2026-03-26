import { useRef, type RefObject } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';

export default function useLogin() {
  const { signIn, isLoading } = useAuthContext();
  const emailRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const passwordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const rememberMeRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const signInHandler = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const rememberMe = rememberMeRef.current.checked;

    void signIn({ email, password, rememberMe });
  };

  return {
    emailRef,
    passwordRef,
    rememberMeRef,
    signInHandler,
    isLoading,
  };
}
