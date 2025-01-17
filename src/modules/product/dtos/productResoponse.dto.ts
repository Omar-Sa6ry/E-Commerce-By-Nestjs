import { ObjectType, Field, Int } from '@nestjs/graphql'
import { IsInt, IsString } from 'class-validator'
import { ColorResponse } from './createPColor.dto'

@ObjectType()
export class ProductResponse {
  @Field()
  @IsInt()
  id: number

  @Field()
  @IsString()
  name: string

  @Field()
  @IsString()
  description: string

  @Field()
  @IsString()
  category: string

  @Field(() => Int)
  @IsInt()
  price: number

  @Field(() => [String])
  images: string[]

  @Field(() => [ColorResponse], { nullable: true })
  colors: ColorResponse[]

  @Field()
  @IsString()
  company: string
}
