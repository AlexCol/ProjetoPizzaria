import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../product/entities/product.entity";

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Order, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'fk_order_item_order' })
  order: Order;

  @ManyToOne(() => Product, { eager: false })
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_order_item_product' })
  product: Product;
}
