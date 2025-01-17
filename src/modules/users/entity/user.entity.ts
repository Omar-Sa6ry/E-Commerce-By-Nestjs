import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Role } from 'src/constant/enum.constant'
import { Address } from 'src/modules/address/entity/address.entity'
import { Cart } from 'src/modules/cart/entity/cart.entity'
import { Company } from 'src/modules/company/entity/company.entity'
import { Order } from 'src/modules/order/entity/order.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  firstName: string

  @Column()
  @Field(() => String)
  lastName: string

  @Column()
  @Field(() => String)
  fullName: string

  @Column({ nullable: true })
  @Field(() => String)
  avatar: string

  @Column({ unique: true })
  @Field(() => String)
  phone: string

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  email: string

  @Column()
  @Field(() => String)
  password: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  addressId: number

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  companyId: number

  @Column({ nullable: true })
  resetToken?: string

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null

  @OneToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'companyId' })
  company: Company

  @OneToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'addressId' })
  address: Address

  @OneToMany(() => Cart, cart => cart.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  cart: Cart[]

  @OneToMany(() => Order, order => order.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  orders: Order[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted User with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated User with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed User with id: ' + this.id)
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateFullName () {
    this.fullName = `${this.firstName} ${this.lastName}`
  }
}
