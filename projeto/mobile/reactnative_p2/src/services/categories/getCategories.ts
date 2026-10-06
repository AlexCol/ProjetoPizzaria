import { Category } from '@/src/models/Category';
import api from '../api';

export async function getCategories() {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for demonstration purposes
  const response = await api<Category[]>({
    method: 'get',
    url: '/categories',
  });

  return response;
}
