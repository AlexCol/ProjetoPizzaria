import api from '../api';

export async function delOrder(orderId: string) {
  await api({
    method: 'delete',
    url: `/orders/${orderId}`,
  });
}
