import loginStyles from "./login.styles";
import { Button } from "@/components/ui/button";

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
