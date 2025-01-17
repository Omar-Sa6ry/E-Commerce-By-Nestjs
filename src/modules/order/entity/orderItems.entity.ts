import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Color } from 'src/modules/color/entity/color.entity'
import { Order } from './order.entity'
import { Product } from '../../product/entity/product.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class OrderItem {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => Int)
  productId: number

  @Column()
  @Field(() => String)
  color: string

  @Field(() => Int)
  @Column()
  quantity: number

  @Column()
  @Field(() => Int)
  totalPrice: number

  @Column()
  @Field(() => Int)
  orderId: number

  @ManyToOne(() => Product, product => product.orderItem, {
    onDelete: 'CASCADE',
  })
  product: Product

  @ManyToMany(() => Color, color => color.orderItem, {
    onDelete: 'SET NULL',
  })
  colors: Color

  @ManyToOne(() => Order, order => order.orderItem, { onDelete: 'CASCADE' })
  order: Order

  @AfterInsert()
  logInsert () {
    console.log('Inserted Order Item with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Order Item with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Order Item with id: ' + this.id)
  }
}
