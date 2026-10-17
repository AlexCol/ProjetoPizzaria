import { NewOrderItemDto } from '@/src/models/dtos/NewOrderItemDto';
import api from '../api';

export async function postOrderItem(orderId: string, orderItem: NewOrderItemDto) {
  // await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay for demonstration purposes
  const response = await api<{ message: string }>({
    method: 'post',
    url: `/orderitems/${orderId}`,
    data: [orderItem],
  });
  return response.message;
}
