import api from '../api';

export async function delOrderItem(orderItem: string) {
  // await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay for demonstration purposes
  await api<{ message: string }>({
    method: 'delete',
    url: `/orderitems/${orderItem}`,
  });
}
