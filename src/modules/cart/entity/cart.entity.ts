import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from '../../users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { CartItem } from './cartItem.enitty'

@Entity()
@ObjectType()
export class Cart {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => Int, { nullable: true })
  totalPrice: number

  @Column()
  @Field(() => Int)
  userId: number

  @ManyToOne(() => User, user => user.cart, {
    onDelete: 'CASCADE',
  })
  user: User

  @OneToMany(() => CartItem, CartItem => CartItem.cart, {
    onDelete: 'SET NULL',
  })
  cartItem: CartItem[]

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
