import axios, { AxiosError, AxiosRequestConfig } from "axios";

const baseUrl = "https://api.themoviedb.org/3/";
const apiKey = process.env.NEXT_PUBLIC_API_JWT;

const core = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json;charset=utf-8",
  },
});

// export function setTokenOnApi(token: string) {
//   if (!token) {
//     delete core.defaults.headers['Authorization'];
//   } else {
//     core.defaults.headers['Authorization'] = `Bearer ${token}`;
//   }
// }

type apiProps = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: any;
  params?: any;
}

async function api<T>(config: apiProps) {
  console.log('🔄 Executando API');
  try {
    const response = await core.request<T>({
      method: config.method,
      url: config.url,
      data: config.data,
      params: { ...config.params, language: 'pt-BR' },
    });
    return response.data;
  } catch (error) {
    let errorHeader = 'Erro inesperado';
    let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';

    if (error instanceof AxiosError) {
      errorHeader = 'Erro na requisição';
      errorMessage = error.response?.data?.error || error.message;
    }
    //throw new Error(`${errorHeader}: ${errorMessage}`);
    throw error;
  }
}
export default {
  get: <T>(url: string, params?: any) => api<T>({ method: 'get', url, params }),
  post: <T>(url: string, data?: any) => api<T>({ method: 'post', url, data }),
  put: <T>(url: string, data?: any) => api<T>({ method: 'put', url, data }),
  delete: <T>(url: string) => api<T>({ method: 'delete', url }),
  patch: <T>(url: string, data?: any) => api<T>({ method: 'patch', url, data }),
};