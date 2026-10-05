import { Product } from '@/src/models/Product';
import api from '../api';

export async function getProducts(categoryId?: string) {
  const response = await api<Product[]>({
    method: 'get',
    url: `/products?status='Active'${categoryId ? `&categoryId=${categoryId}` : ''}`,
  });

  return response;
}
