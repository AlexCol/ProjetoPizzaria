import { EOrderStatus } from './enums/EOrderStatus';
import { OrderItem } from './OrderItem';

export type Order = {
  id: number;
  tableNumber: number;
  status: EOrderStatus;
  name?: string;
  userId: number;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
};
