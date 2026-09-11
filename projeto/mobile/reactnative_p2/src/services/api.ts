import axios, { AxiosError } from 'axios';
import { environment } from '../config/environment';

/******************************************/
/* Tipagens dos processos                 */
/******************************************/
//#region Tipagens dos processos
type AuthFailHandler = (() => void | Promise<void>) | null;

type ApiProps = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: unknown;
  params?: unknown;
};
//#endregion

/******************************************/
/* Variaveis Locais                       */
/******************************************/
//#region Variaveis Locais
const baseURL = environment.apiUrl?.replace(/\/$/, '');
let sessionToken = '';
let onAuthFail: AuthFailHandler = null;
//#endregion

/******************************************/
/* Metodos Auxiliares Publicos            */
/******************************************/
//#region Metodos Auxiliares Publicos
//! getter url
export function getApiBaseUrl() {
  return baseURL;
}

//! getter e setter do token
export function getTokenFromApi() {
  return sessionToken;
}

export function setTokenOnApi(value: string) {
  sessionToken = value;
}

//! setter do handler de falha de autenticação
export function setAuthFailHandler(handler: AuthFailHandler) {
  onAuthFail = handler;
}

//! centraliza a chamada de onAuthFail e permite usar no SSE
export function notifyAuthFail() {
  void onAuthFail?.();
}
//#endregion

/******************************************/
/* Metodos Core (Privado, usado na 'api') */
/******************************************/
//#region Metodos Core (Privado)
// eslint-disable-next-line import/no-named-as-default-member
const core = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'app-origin': 'mobile',
  },
});

//! interceptador para adicionar o token
core.interceptors.request.use((config) => {
  if (sessionToken) {
    config.headers.Authorization = sessionToken;
  }

  return config;
});

//! interceptador para deslogar em caso de erro 401 da sessão atual
core.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestToken = error.config?.headers.get('Authorization');

      if (requestToken && requestToken === sessionToken) {
        notifyAuthFail();
      }
    }

    return Promise.reject(error);
  },
);
//#endregion

/******************************************/
/* Api centralizadora de requisições      */
/******************************************/
//#region Api centralizadora de requisições
const api = async <T>(config: ApiProps) => {
  try {
    const response = await core.request<T>({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
    });

    return response.data;
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';

    if (error instanceof AxiosError) {
      const responseMessage = error.response?.data as { Message?: string[] } | undefined;
      errorMessage = responseMessage?.Message?.[0] ?? error.message;
    }

    throw new Error(errorMessage);
  }
};

export default api;
//#endregion
