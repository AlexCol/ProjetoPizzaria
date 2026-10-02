import { Product } from './Product';

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  amount: number;
  createdAt: string;
  updatedAt: string;
};
