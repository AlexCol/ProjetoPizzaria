import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  // @IsNotEmpty()
  // @IsNumber()
  // orderId: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
