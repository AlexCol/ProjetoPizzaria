import { useAuthContext } from "@/components/contexts/auth/AuthContext";
import { FormEvent, RefObject, useRef } from "react";

export default function useLogin() {
  const { signIn, isLoadingAuth, error, message } = useAuthContext();
  const emailRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const passwordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const signInHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    signIn({ email, password });
  }

  return {
    emailRef,
    passwordRef,
    signInHandler,
    isLoadingAuth,
    error,
    message
  }
}