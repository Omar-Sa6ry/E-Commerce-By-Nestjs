import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Product } from './product.entity'

@Entity()
@ObjectType()
export class Images {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  path: string

  @Field(() => Int)
  @Column()
  productId: number

  @ManyToOne(() => Product, product => product.images, { onDelete: 'CASCADE' })
  product: Product

  @AfterInsert()
  logInsert () {
    console.log('Inserted Images with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Images with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Images with id: ' + this.id)
  }
}
