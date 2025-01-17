import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class OrderFilterDto {
  @Field({ nullable: true })
  paymentStatus?: string

  @Field({ nullable: true })
  orderStatus?: string

  @Field({ nullable: true })
  minPrice?: number

  @Field({ nullable: true })
  maxPrice?: number
}
