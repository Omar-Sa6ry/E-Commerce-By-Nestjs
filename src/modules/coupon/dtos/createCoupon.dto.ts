import { InputType, Field } from '@nestjs/graphql'
import { IsDate, IsInt, IsString } from 'class-validator'

@InputType()
export class CreateCouponDto {
  @Field()
  @IsDate()
  expiryDate: Date

  @Field()
  @IsString()
  name: string

  @Field()
  @IsString()
  type: string

  @Field()
  @IsInt()
  discount: number
}
