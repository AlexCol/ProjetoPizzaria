import api from '../api';

export async function sendOrder(orderId: string) {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay for demonstration purposes
  const response = await api<{ message: string }>({
    method: 'patch',
    url: `/orders/status/${orderId}`,
    data: { status: 'Pending' },
  });
  return response;
}
