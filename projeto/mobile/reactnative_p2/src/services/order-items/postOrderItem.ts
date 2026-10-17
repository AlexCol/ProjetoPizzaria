import { NewOrderItemDto } from '@/src/models/dtos/NewOrderItemDto';
import api from '../api';

export async function postOrderItem(orderId: string, orderItem: NewOrderItemDto) {
  const data = [orderItem];
  console.log(data);

  const response = await api<{ message: string }>({
    method: 'post',
    url: `/orderitems/${orderId}`,
    data: [orderItem],
  });
  return response.message;
}
