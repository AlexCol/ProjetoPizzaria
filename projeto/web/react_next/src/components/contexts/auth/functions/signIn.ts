import LoggedUser from "@/models/LoggedUser";
import api, { setRememberMe } from "@/services/api";

export type signInParams = {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default async function signIn(params: signInParams): Promise<LoggedUser | string> {
  const { email, password } = params;
  try {
    setRememberMe(params.rememberMe);

    const login = await api({
      method: 'post',
      url: '/auth/login',
      data: { email, password }
    })

    const loggedUser = await api({
      method: 'get',
      url: '/users/me'
    });

    return loggedUser;
  } catch (error) { //erro é tratado na 'api', vem como erro generico por conveniência
    let errorMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage;
  }
}
