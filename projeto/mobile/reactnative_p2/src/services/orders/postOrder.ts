import { NewOrderDto } from '@/src/models/dtos/NewOrderDto';
import { Order } from '@/src/models/Order';
import api from '../api';

export async function postOrder(order: NewOrderDto) {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for demonstration purposes
  const response = await api<Order>({
    method: 'post',
    url: '/orders',
    data: order,
  });
  return response;
}
