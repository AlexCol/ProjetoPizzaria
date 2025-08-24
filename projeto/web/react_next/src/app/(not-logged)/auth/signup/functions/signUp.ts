import api from "@/services/api";

type signUpParams = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
}

type signUpResponse = {
  status: 'succeeded' | 'error';
  message: string;
}

export default async function signUp(params: signUpParams): Promise<signUpResponse> {
  try {
    await api({
      method: 'post',
      url: '/users',
      data: params
    });

    return {
      status: 'succeeded',
      message: 'Usuário cadastrado com sucesso'
    };
  } catch (error) { //erro é tratado na 'api', vem como erro generico por conveniência
    let errorMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      status: 'error',
      message: errorMessage
    };
  }
}