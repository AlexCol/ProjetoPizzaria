import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { OrderItem } from "./order-item.entity";

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table: number;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'boolean', default: true })
  draft: boolean;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => OrderItem,
    orderItem => orderItem.order,
    { /*eager: true,*/ cascade: true }  //removido eager pois ele força todos os campos a serem carregados
  )
  itens: OrderItem[];
}
