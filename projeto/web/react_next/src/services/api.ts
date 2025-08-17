import axios, { AxiosError } from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API;

const core = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setTokenOnApi(token: string) {
  if (!token) {
    delete core.defaults.headers.common['Authorization']; // Remove o token se não for fornecido
  } else {
    core.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Define o token no cabeçalho Authorization
  }
}

type apiProps = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: any;
  params?: any;
}
const api = async (config: apiProps) => {
  try {
    const response = await core.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
    });
    return response.data;
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';

    if (error instanceof AxiosError)
      errorMessage = error.response?.data?.message || errorMessage;

    throw new Error(errorMessage);
  }
}
export default api;