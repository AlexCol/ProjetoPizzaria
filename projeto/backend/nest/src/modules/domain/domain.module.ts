import { Module } from "@nestjs/common";
import { UsersModule } from "./models/users/users.module";
import { CategoryModule } from "./models/category/category.module";
import { OrderItemModule } from "./models/order-item/order-item.module";
import { OrderModule } from "./models/order/order.module";
import { ProductModule } from "./models/product/product.module";
import { UsersService } from "./models/users/users.service";

@Module({
  imports: [
    CategoryModule,
    OrderModule,
    OrderItemModule,
    ProductModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    UsersModule, //exportando para que AuthModule possa usar o UsersService
  ]
})
export class DomainModule { }
