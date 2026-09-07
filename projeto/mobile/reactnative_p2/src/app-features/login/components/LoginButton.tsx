import { Button } from '@/src/components/base';
import { UseLoginStates } from '../useLogin';

interface LoginButtonProps {
  states: UseLoginStates;
}

export default function LoginButton({ states }: LoginButtonProps) {
  const { handleSignIn, isLoading } = states;

  return (
    <Button
      title="Login"
      variant="success"
      loading={isLoading}
      buttonPros={{
        onPress: handleSignIn
      }}
    />
  )
}