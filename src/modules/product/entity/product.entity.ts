import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Company } from 'src/modules/company/entity/company.entity'
import { Images } from './images.entity'
import { Color } from 'src/modules/color/entity/color.entity'
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
import { CartItem } from 'src/modules/cart/entity/cartItem.enitty'
import { OrderItem } from 'src/modules/order/entity/orderItems.entity'

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  name: string

  @Column()
  @Field(() => String)
  description: string

  @Column()
  @Field(() => Int)
  price: number

  @Column()
  @Field(() => Int)
  discount: number

  @Column()
  @Field(() => String)
  category: string

  @Field(() => Int)
  @Column()
  companyId: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @Field(() => [Images])
  @OneToMany(() => Images, image => image.product, { onDelete: 'SET NULL' })
  images: Images[]

  @Field(() => [Color])
  @OneToMany(() => Color, color => color.product, { onDelete: 'SET NULL' })
  colors: Color[]

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, CartItem => CartItem.product, {
    onDelete: 'SET NULL',
  })
  cartItem: CartItem[]

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, orderItem => orderItem.product, {
    onDelete: 'SET NULL',
  })
  orderItem: OrderItem[]

  @ManyToOne(() => Company, company => company.products, {
    onDelete: 'CASCADE',
  })
  company: Company

  @BeforeInsert()
  @BeforeUpdate()
  updateDiscount(){
    if(this.discount===null){
      this.discount=this.price
    }
  }

  @AfterInsert()
  logInsert () {
    console.log('Inserted Product with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Product with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Product with id: ' + this.id)
  }
}
