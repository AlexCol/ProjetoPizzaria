import { Product } from './Product';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  amount: number;
  createdAt: string;
  updatedAt: string;
};
