import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "../../order/entities/order.entity";
import { Product } from "../../product/entities/product.entity";

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'fk_order_item_order' })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_order_item_product' })
  product: Product;
}
