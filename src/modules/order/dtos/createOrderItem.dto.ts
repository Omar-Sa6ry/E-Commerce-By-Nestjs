import { Field, InputType } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'

@InputType()
export class CreateOrderItemDto {
  @Field()
  @IsInt()
  productId: number

  @Field()
  @IsInt()
  quantity: number

  @Field()
  @IsString()
  color: string
}
