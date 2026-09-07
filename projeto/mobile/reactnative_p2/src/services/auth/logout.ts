import { AuthResponse } from '@/src/models/AuthResponse';
import api from '../api';

export async function logout() {
  await api<AuthResponse>({
    method: 'post',
    url: '/auth/logout',
  });
}
