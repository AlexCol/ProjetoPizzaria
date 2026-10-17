import { Order } from '@/src/models/Order';
import api from '../api';

export async function getOrder(orderId: string) {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for demonstration purposes
  const response = await api<Order>({
    method: 'get',
    url: `/orders/${orderId}`,
  });
  return response;
}
