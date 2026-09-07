import { AuthResponse } from '@/src/models/AuthResponse';
import api from '../api';

export async function login(email: string, password: string) {
  const response = await api<AuthResponse>({
    method: 'post',
    url: '/auth/login-app',
    data: {
      email,
      password,
    },
  });

  return response;
}
