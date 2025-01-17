import { ObjectType, Field, Int } from '@nestjs/graphql'
import { CartItemResponse } from './cartItem.dto'

@ObjectType()
export class CartResponse {
  @Field(() => Int)
  id: number

  @Field(() => Int)
  totalPrice: number

  @Field(() => Int)
  userId: number

  @Field(() => [CartItemResponse])
  cartItems: CartItemResponse[]
}
