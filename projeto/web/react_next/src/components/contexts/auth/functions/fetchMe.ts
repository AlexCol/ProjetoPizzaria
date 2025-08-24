import LoggedUser from "@/models/LoggedUser";
import api, { setRememberMe } from "@/services/api";

export default async function fetchMe(): Promise<LoggedUser | string> {
  try {
    setRememberMe(false); //vai valer o que está no storage
    const data = await api({
      method: 'get',
      url: '/users/me'
    });
    return data;
  } catch (error) {
    let errMessage = 'Erro ao buscar usuário';
    if (error instanceof Error)
      errMessage = error.message;

    // token expirado → devolve string vazia
    if (errMessage.includes('jwt expired') || errMessage === 'Token not found') {
      errMessage = '';
    }
    return errMessage;
  }
}