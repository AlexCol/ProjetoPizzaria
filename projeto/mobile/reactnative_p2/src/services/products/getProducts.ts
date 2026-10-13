import { Product } from '@/src/models/Product';
import api from '../api';

export async function getProducts(categoryId?: string) {
  const response = await api<any>({
    method: 'get',
    url: `/products/search?status=Active${categoryId ? `&categoryId=${categoryId}` : ''}`,
  });

  return response.data as Product[];
}
