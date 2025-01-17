import { InputType, Field } from '@nestjs/graphql'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateCouponDto {
  @Field()
  @IsOptional()
  @IsDate()
  expiryDate: string

  @Field()
  @IsOptional()
  @IsString()
  name: string

  @Field()
  @IsOptional()
  @IsString()
  type: string

  @Field()
  @IsOptional()
  @IsInt()
  discount: number
}
