import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { CategoryModule } from "./category/category.module";
import { OrderItemModule } from "./order-item/order-item.module";
import { OrderModule } from "./order/order.module";
import { ProductModule } from "./product/product.module";

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
})
export class DomainModule { }
