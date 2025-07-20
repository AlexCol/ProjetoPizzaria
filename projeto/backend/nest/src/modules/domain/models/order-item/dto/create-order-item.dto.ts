import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
