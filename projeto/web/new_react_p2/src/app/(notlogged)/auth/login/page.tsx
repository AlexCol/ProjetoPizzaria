import { Button } from '@/components/ui/button';
import loginStyles from './login.styles';

function Login() {
  return (
    <div className={loginStyles.containerTC}>
      <div className={loginStyles.cardTC}>
        Login
        <Button variant='default' size='sm'>Login</Button>
      </div>
    </div>
  );
}

export default Login;
