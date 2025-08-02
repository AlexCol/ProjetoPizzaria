import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, [
    'itens', // itens não está incluído - não pode ser atualizado
  ] as const)
) {

}