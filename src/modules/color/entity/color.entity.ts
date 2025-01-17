import { Field, Int, ObjectType } from '@nestjs/graphql'
import { CartItem } from 'src/modules/cart/entity/cartItem.enitty'
import { OrderItem } from 'src/modules/order/entity/orderItems.entity'
import { Product } from 'src/modules/product/entity/product.entity'
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
export class Color {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  name: string

  @Column()
  @Field(() => Int)
  quantity: number

  @Field(() => Int)
  @Column()
  productId: number

  @ManyToOne(() => Product, product => product.colors, { onDelete: 'CASCADE' })
  product: Product

  @ManyToMany(() => CartItem, CartItem => CartItem.colors, {
    onDelete: 'SET NULL',
  })
  cartItem: CartItem

  @ManyToMany(() => OrderItem, orderItem => orderItem.colors, {
    onDelete: 'SET NULL',
  })
  orderItem: OrderItem

  @AfterInsert()
  logInsert () {
    console.log('Inserted Color with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Color with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Color with id: ' + this.id)
  }
}
