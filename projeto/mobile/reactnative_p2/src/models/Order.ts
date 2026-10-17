import { EOrderStatus } from './enums/EOrderStatus';
import { OrderItem } from './OrderItem';

export type Order = {
  id: string;
  tableNumber: number;
  status: EOrderStatus;
  name?: string;
  userId: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
};
