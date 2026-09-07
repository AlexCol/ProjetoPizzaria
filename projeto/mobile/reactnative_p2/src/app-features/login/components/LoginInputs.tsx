import { Input } from '@/src/components/base';
import { UseLoginStates } from '../useLogin';

interface LoginInputsProps {
  states: UseLoginStates;
}

export default function LoginInputs({ states }: LoginInputsProps) {
  const { theme } = states;
  const { emailRef, emailInputRef, passwordRef, passwordInputRef } = states;

  return (
    <>
      <Input
        ref={emailInputRef}
        label='Email'
        textInputProps={{
          placeholder: "Email",
          placeholderTextColor: theme.colors.disabled,
          keyboardType: "email-address",
          autoCapitalize: "none",
          onChangeText: (text) => { emailRef.current = text },
        }}
      />

      <Input
        ref={passwordInputRef}
        label='Password'
        textInputProps={{
          placeholder: "Password",
          placeholderTextColor: theme.colors.disabled,
          secureTextEntry: true,
          autoCapitalize: "none",
          onChangeText: (text) => { passwordRef.current = text },
        }}
      />
    </>
  )
}