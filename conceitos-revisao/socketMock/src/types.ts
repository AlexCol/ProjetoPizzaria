// Interface para dados do comando genérico
export interface GenericCommandData {
  service: string;
  data: any;
}

// Interface para resposta do servidor
export interface ServerResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Interface para eventos recebidos
export interface EventData {
  type: string;
  payload: any;
  timestamp?: string;
}