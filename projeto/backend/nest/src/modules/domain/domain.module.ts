import { Module } from "@nestjs/common";
import { UsersModule } from "./models/users/users.module";
import { CategoryModule } from "./models/category/category.module";
import { OrderModule } from "./models/order/order.module";
import { ProductModule } from "./models/product/product.module";

@Module({
  imports: [
    CategoryModule,
    OrderModule,
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
