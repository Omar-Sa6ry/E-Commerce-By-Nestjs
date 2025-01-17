import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class OrderSortDto {
  @Field({ nullable: true })
  orderId?: 'asc' | 'desc'

  @Field({ nullable: true })
  totalPrice?: 'asc' | 'desc'
}
