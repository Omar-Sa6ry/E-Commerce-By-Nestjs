import { Field, InputType } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'

@InputType()
export class CreateColorDto {
  @Field()
  @IsInt()
  productId: number

  @Field()
  @IsString()
  name: string

  @Field()
  @IsInt()
  quantity: number
}
