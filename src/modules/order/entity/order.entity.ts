import { Field, Int, ObjectType } from '@nestjs/graphql'
import { OrderStatus, PaymentStatus } from 'src/constant/enum.constant'
import { Address } from 'src/modules/address/entity/address.entity'
import { Coupon } from 'src/modules/coupon/entity/coupon.entity'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { OrderItem } from './orderItems.entity'

@Entity()
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ default: 0 })
  @Field(() => Int)
  totalPrice: number

  @Column()
  @Field(() => Int)
  discount: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @Field(() => String)
  orderStatus: string

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  @Field(() => String)
  paymentStatus: string

  @Column()
  @Field(() => Int)
  userId: number

  @Field(() => Int)
  @ManyToOne(() => Address, address => address.id, { onDelete: 'SET NULL' })
  addressId: number

  @ManyToOne(() => User, user => user.orders, {
    onDelete: 'CASCADE',
  })
  user: User

  @OneToMany(() => OrderItem, orderItem => orderItem.order, {
    onDelete: 'SET NULL',
  })
  orderItem: OrderItem[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted Order with id: ' + this.id)
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateDiscount () {
    if (this.discount === null) {
      this.discount = this.totalPrice
    }
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Order with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Order with id: ' + this.id)
  }
}
