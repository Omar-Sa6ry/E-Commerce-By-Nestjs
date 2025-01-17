import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Cart } from './cart.entity'
import { Color } from 'src/modules/color/entity/color.entity'
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
export class CartItem {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => Int)
  productId: number

  @Column()
  @Field(() => String)
  color: string

  @Column()
  @Field(() => Int)
  quantity: number

  @Column()
  @Field(() => Int)
  totalPrice: number

  @Column()
  @Field(() => Int)
  cartId: number

  @ManyToOne(() => Product, product => product.cartItem, {
    onDelete: 'CASCADE',
  })
  product: Product

  @ManyToMany(() => Color, color => color.cartItem, {
    onDelete: 'CASCADE',
  })
  colors: Color

  @ManyToOne(() => Cart, cart => cart.cartItem, {
    onDelete: 'CASCADE',
  })
  cart: Cart
  
  @AfterInsert()
  logInsert () {
    console.log('Inserted Cart with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Cart with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Cart with id: ' + this.id)
  }
}
