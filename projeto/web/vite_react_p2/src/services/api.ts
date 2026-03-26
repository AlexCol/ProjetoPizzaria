// src/services/api.ts (seu serviço existente com ajustes)
import axios, { AxiosError } from 'axios';

/*****************************************************************/
/* Configuração base                                             */
/*****************************************************************/
const baseUrl = import.meta.env.VITE_API_URL;
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_BASE não está definido. API client não pode ser criado.');
}

const core = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'app-origin': 'web', // Identificador para o backend
  },
  withCredentials: true,
});

//! Configuração para lidar com falhas de autenticação
let onAuthFail: (() => void) | null = null;
export function setAuthFailHandler(handler: () => void) {
  onAuthFail = handler;
}

//! Exportar uma função que retorna o AxiosInstance
//! O Orval consegue trabalhar direto com Axios instances
export function getApiClient() {
  return core;
}

/*****************************************************************/
/* Funções auxiliares                                            */
/*****************************************************************/
//! funções de controle para rememberMe (se cookie vai ser de sessão ou persistente)
export function setRememberMe(rememberMe: boolean) {
  core.defaults.headers.common['remember-me'] = rememberMe;
}

//! função para limpar o remember-me, útil para logout
export function forgetMe() {
  delete core.defaults.headers.common['remember-me'];
}

//! Adicionar interceptadores para tratamento de erro
core.interceptors.response.use(
  (response) => response,
  async (error) => {
    await handleException(error);
  },
);

//! Função para lidar com exceções, extrair mensagens de erro e verificar se é necessário logout
async function handleException(error: unknown) {
  let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';

  if (error instanceof AxiosError) {
    errorMessage = error.response?.data?.message || errorMessage;
    checkIfNeedToLogout(error);
  }

  return Promise.reject(new Error(errorMessage));
}

//! Verificar se o erro é de autenticação e acionar o handler de falha de autenticação
function checkIfNeedToLogout(error: AxiosError) {
  if (!error.response) return;
  const statusCode = error.response.status;
  if (statusCode === 401 && onAuthFail) {
    onAuthFail();
  }
}
