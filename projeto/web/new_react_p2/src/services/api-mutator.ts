import type { AxiosRequestConfig } from 'axios';
import { getApiClient } from './api';

export const apiClient = async <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  const client = getApiClient();
  const response = await client.request(config);
  return response.data as T;
};
