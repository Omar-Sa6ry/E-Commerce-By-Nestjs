import { Field, InputType } from '@nestjs/graphql'
import { CreateOrderItemDto } from './createOrderItem.dto'
import { IsArray, IsOptional } from 'class-validator'

@InputType()
export class CreateOrderDto {
  @Field(() => [CreateOrderItemDto])
  @IsArray()
  item: CreateOrderItemDto[]

  @IsOptional()
  @Field(() => String, { nullable: true })
  coupon?: string
}
