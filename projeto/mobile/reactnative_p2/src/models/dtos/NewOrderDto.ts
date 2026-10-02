import { NewOrderItemDto } from './NewOrderItemDto';

export type NewOrderDto = {
  tableNumber: number;
  name?: string;
  orderItems?: NewOrderItemDto[];
};
