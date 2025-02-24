import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Order } from 'src/modules/order/entity/order.entity'
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
export class Address {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  government: string

  @Column()
  @Field(() => String)
  city: string

  @Column()
  @Field(() => String)
  street: string

  @Column()
  @Field(() => String)
  country: string

  @Column()
  @Field(() => Int)
  zipCode: number

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  userId: number

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @AfterInsert()
  logInsert () {
    console.log('Inserted Address with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Address with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Address with id: ' + this.id)
  }
}
