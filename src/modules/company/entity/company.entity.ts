import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Address } from 'src/modules/address/entity/address.entity'
import { Product } from 'src/modules/product/entity/product.entity'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Company {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  name: string

  @Column({ nullable: true })
  @Field(() => String)
  website?: string

  @Column({ unique: true })
  @Field(() => String)
  phone: string

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  email: string

  @Field(() => Int)
  @OneToOne(() => Address, address => address.id, { onDelete: 'SET NULL' })
  addressId: number

  @Field(() => [Product])
  @OneToMany(() => Product, product => product.company)
  products?: Product[]

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  userId: number

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User

  @AfterInsert()
  logInsert () {
    console.log('Inserted Company with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Company with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Company with id: ' + this.id)
  }
}
