import { Field, Int, ObjectType } from '@nestjs/graphql'
import { TypeCoupon } from 'src/constant/enum.constant'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Coupon {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ unique: true })
  @Field(() => String)
  name: string

  @Field(() => Int)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number

  @Field(() => String)
  @Column({ type: 'enum', enum: TypeCoupon, default: TypeCoupon.FIXED })
  type: string

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  expiryDate: Date

  @AfterInsert()
  logInsert () {
    console.log('Inserted Coupon with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Coupon with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Coupon with id: ' + this.id)
  }
}
