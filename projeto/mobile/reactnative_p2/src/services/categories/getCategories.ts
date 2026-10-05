import { Category } from '@/src/models/Category';
import api from '../api';

export async function getCategories() {
  const response = await api<Category[]>({
    method: 'get',
    url: '/categories',
  });

  return response;
}
