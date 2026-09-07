import { Session } from '@/src/models/Session';
import api from '../api';

export async function getMe() {
  const response = await api<Session>({
    method: 'get',
    url: '/auth/session',
  });

  return response;
}
