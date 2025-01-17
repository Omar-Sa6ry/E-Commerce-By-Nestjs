import { Field, InputType } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString } from 'class-validator'
import { CreatePColorDto } from './createPColor.dto'

@InputType()
export class CreateProductDto {
  @Field()
  @IsString()
  name: string

  @Field()
  @IsString()
  category: string

  @Field()
  @IsString()
  description: string

  @Field()
  @IsInt()
  price: number

  @IsOptional()
  @Field()
  @IsInt()
  discount?: number

  @Field(() => [CreatePColorDto])
  colors: CreatePColorDto[]
}
