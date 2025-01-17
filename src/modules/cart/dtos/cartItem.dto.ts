import { InputType, Field, ObjectType } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'
import { ProductResponse } from 'src/modules/product/dtos/productResoponse.dto'

@InputType()
export class CartItemDto {
  @Field()
  @IsInt()
  productId: number

  @Field()
  @IsString()
  color: string

  @Field()
  @IsInt()
  quantity: number
}

@ObjectType()
export class CartItemResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  color: string

  @Field()
  @IsInt()
  quantity: number

  @Field(() => ProductResponse)
  product: ProductResponse
}
