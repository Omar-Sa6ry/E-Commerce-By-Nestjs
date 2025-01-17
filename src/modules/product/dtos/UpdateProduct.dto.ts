import { InputType, Field, Int } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateProductDto {
  @IsOptional()
  @Field()
  @IsString()
  name?: string

  @IsOptional()
  @Field()
  @IsString()
  category?: string

  @IsOptional()
  @Field()
  @IsString()
  description?: string

  @IsOptional()
  @Field()
  @IsInt()
  price?: number

  @IsOptional()
  @Field()
  @IsInt()
  discount?: number
}
